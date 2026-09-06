/**
 * Minimal CDP (Chrome DevTools Protocol) driver used by the e2e tests.
 * Zero dependencies: drives a real headless Chrome through its JSON/WS
 * debugging endpoints using Node's built-in fetch + WebSocket (Node >= 22).
 *
 * Only the handful of primitives the tests need are implemented:
 *   navigate / wait / text / eval / fillInput / clickButton / countLoads
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe")
      : null,
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  throw new Error(
    "Chrome/Edge not found. Set CHROME_PATH to your browser executable.",
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForJson(port, pathname, timeoutMs, method = "GET") {
  const deadline = Date.now() + timeoutMs;
  let lastErr;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}${pathname}`, { method });
      if (r.ok) return r;
      lastErr = new Error(`HTTP ${r.status}`);
    } catch (e) {
      lastErr = e;
    }
    await sleep(200);
  }
  throw lastErr || new Error(`Timed out waiting for ${pathname}`);
}

/**
 * Launch headless Chrome with a throwaway profile and CDP on a random port.
 * Returns { proc, page } — page is a CdpPage already connected to a blank tab.
 */
export async function launchChrome() {
  const port = 9300 + Math.floor(Math.random() * 600);
  const profile = path.join(
    os.tmpdir(),
    `wacos-e2e-${process.pid}-${Date.now()}`,
  );
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-networking",
    "--window-size=1360,960",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`,
    "about:blank",
  ];
  const proc = spawn(findChrome(), args, { stdio: "ignore" });
  let target;
  try {
    const res = await waitForJson(port, "/json/new?about:blank", 30000, "PUT");
    target = await res.json();
  } catch (e) {
    try {
      proc.kill();
    } catch {}
    throw new Error(`Chrome CDP did not come up: ${e.message}`);
  }
  const page = new CdpPage(target.webSocketDebuggerUrl, proc, profile);
  await page.ready();
  return { proc, page, profile };
}

class CdpPage {
  constructor(wsUrl, proc, profile) {
    this.wsUrl = wsUrl;
    this.proc = proc;
    this.profile = profile;
    this.ws = new WebSocket(wsUrl);
    this._id = 0;
    this._pending = new Map();
    this._listeners = new Map();
    this._loads = 0;
    this._consoleErrors = [];
    this._ready = new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(new Error("WebSocket error: " + e.message));
    });
    this.ws.onmessage = (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (msg.id && this._pending.has(msg.id)) {
        const { resolve, reject } = this._pending.get(msg.id);
        this._pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
        return;
      }
      if (msg.method) {
        if (msg.method === "Page.loadEventFired") this._loads += 1;
        if (msg.method === "Runtime.exceptionThrown") {
          const t = msg.params?.exceptionDetails?.text || "exception";
          const desc = msg.params?.exceptionDetails?.exception?.description || "";
          this._consoleErrors.push(t + " " + desc);
        }
        const hs = this._listeners.get(msg.method) || [];
        for (const h of hs) {
          try {
            h(msg.params || {});
          } catch {}
        }
      }
    };
  }

  ready() {
    return this._ready;
  }

  async send(method, params = {}) {
    const id = ++this._id;
    return new Promise((resolve, reject) => {
      this._pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  /** Enable the domains we use (must be called before navigating). */
  async enable() {
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("Log.enable");
  }

  on(method, handler) {
    if (!this._listeners.has(method)) this._listeners.set(method, []);
    this._listeners.get(method).push(handler);
  }

  async navigate(url) {
    await this.send("Page.navigate", { url });
  }

  async eval(expression) {
    const r = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) {
      throw new Error(
        "eval threw: " +
          (r.exceptionDetails.exception?.description ||
            r.exceptionDetails.text ||
            "unknown"),
      );
    }
    return r.result?.value;
  }

  async text() {
    return (
      (await this.eval("document.body ? document.body.innerText : ''")) || ""
    );
  }

  /** Poll an expression until truthy or the timeout elapses. */
  async waitFor(expression, { timeout = 30000, interval = 300 } = {}) {
    const deadline = Date.now() + timeout;
    let last;
    while (Date.now() < deadline) {
      try {
        last = await this.eval(expression);
        if (last) return last;
      } catch {
        // page mid-navigation — retry
      }
      await sleep(interval);
    }
    const body = (await this.text()).slice(0, 400).replace(/\s+/g, " ");
    throw new Error(
      `waitFor timed out after ${timeout}ms\n  expr: ${expression}\n  last: ${JSON.stringify(last)}\n  body: ${body}`,
    );
  }

  /** Fill a React-controlled input (index within the input list) and flush state. */
  async fillInput(index, value) {
    const set = `(() => {
      const el = document.querySelectorAll('input')[${index}];
      if (!el) return 'no-input';
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, ${JSON.stringify(value)});
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return el.value;
    })()`;
    const got = await this.eval(set);
    if (got === "no-input") throw new Error(`fillInput: input #${index} not found`);
    await sleep(80);
    return got;
  }

  /** Click the first button / link whose visible text contains `label`. */
  async clickByText(label) {
    const clicked = await this.eval(`(() => {
      const els = Array.from(document.querySelectorAll('button, a'));
      const el = els.find((n) => (n.innerText || '').trim().includes(${JSON.stringify(label)}));
      if (!el) return 'not-found';
      el.click();
      return 'clicked';
    })()`);
    if (clicked !== "clicked") {
      throw new Error(`clickByText("${label}"): element not found`);
    }
    await sleep(120);
  }

  countLoads() {
    return this._loads;
  }

  consoleErrors() {
    return this._consoleErrors;
  }

  async close() {
    try {
      this.ws.close();
    } catch {}
    try {
      this.proc.kill();
    } catch {}
    // Give the browser a moment, then remove its throwaway profile.
    await sleep(300);
    try {
      fs.rmSync(this.profile, { recursive: true, force: true });
    } catch {}
  }
}

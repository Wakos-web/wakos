-- Campus Gallery (About page) CMS section.
-- The journal gallery on /about reads page_content[about/gallery].images =
-- [{ src, alt, caption }]; admins manage it (with real file uploads to the
-- `uploads` storage bucket) from Admin > Page Content. Empty images array
-- means the page falls back to its bundled default photos.
insert into page_content (page, section, title, content, published)
select 'about', 'gallery', 'Campus Gallery', '{"images": []}'::jsonb, true
where not exists (
  select 1 from page_content where page = 'about' and section = 'gallery'
);

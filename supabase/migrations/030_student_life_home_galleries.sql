-- CMS-backed journal galleries for Student Life and the Homepage (same
-- pattern as the About Campus Gallery): page_content[page/gallery].images =
-- [{ src, alt, caption }]. Admins manage them from Admin > Page Content with
-- real file uploads; an empty images array means the page falls back to its
-- bundled default photos.
insert into page_content (page, section, title, content, published)
select 'student-life', 'gallery', 'Campus Life Gallery', '{"images": []}'::jsonb, true
where not exists (
  select 1 from page_content where page = 'student-life' and section = 'gallery'
);

insert into page_content (page, section, title, content, published)
select 'home', 'gallery', 'Life at WACOS Gallery', '{"images": []}'::jsonb, true
where not exists (
  select 1 from page_content where page = 'home' and section = 'gallery'
);

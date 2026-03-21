import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),
  route("reviews", "routes/reviews.tsx"),
  route("faq", "routes/faq.tsx"),
  route("blog", "routes/blog.tsx"),
  route("blog/:slug", "routes/blog-post.tsx"),
  route("book", "routes/book.tsx"),
  route("services/:slug", "routes/service.tsx"),
] satisfies RouteConfig;

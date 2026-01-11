---
title: A Brief Note on the Blog's Labor Day Redesign
pubDate: 2025-05-03 03:00:00
lastModDate: 2025-05-03 03:00:00
description: 'Documenting the process of redesigning the blog using the fuwari theme, including Vercel deployment, migrating features from the old theme (projects, friends links, article list styling), and the experience of using an AI IDE for assisted development.'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503031704734.png?imageSlim'
tags: [Astro, fuwari, Vercel, Blog, Theme Customization, Frontend Development, AI Programming]
category: 'Life Notes'
draft: false
lang: en
---

## Preface

After rebuilding the blog, I've been continuously tweaking the website's details. Initially, I chose [NotionNext](https://notion-next-kohl-rho-39.vercel.app/) based on my heavy use of Notion, but it felt overly bloated. Therefore, at the end of last year, I decided to switch to Astro to optimize the site's loading speed and user experience.

When switching to Astro, I selected the [astro-gyoza](https://github.com/lxchapu/astro-gyoza) theme. Its excellent performance gave me a profound experience of the extreme speed advantages of static websites. With the May Day holiday, I decided to give the blog another makeover.

This time, I found a nice-looking template called [fuwari](https://github.com/saicaca/fuwari) and embarked on my blog renovation journey.

## Redeployment

I chose to deploy my site using Vercel. The entire deployment process is quite straightforward: first, Fork the `fuwari` project, then link your GitHub account in Vercel to initiate the deployment.

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250502234237550.png?imageSlim)

Next, access the Vercel dashboard, find the corresponding project, and click the "Deploy" button to start the deployment process.

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250502234327982.png?imageSlim)

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250502234432832.png?imageSlim)

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250502234451092.png?imageSlim)

Once deployment is successful, you can view the website's access address in the Vercel dashboard.

## Feature Migration

While using the `astro-gyoza` theme, I particularly liked some of its features. However, after switching to the `fuwari` theme, I found these features were not built-in. Therefore, I decided to migrate them myself.

### Projects Page

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250502234738212.png?imageSlim)

I migrated the image, title, and description display functionality for projects from the original theme to the new one. I also borrowed the time-scrolling style from the `gyoza` theme's archive page and applied it to the new projects page.

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503025806690.png?imageSlim)

### Friends Links Page

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503030027875.png?imageSlim)

The `fuwari` theme does not include a friends links feature by default. I migrated the friends links page from the previous theme and additionally added a code copy function for easy copying of code snippets.

### Simplified Article List

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503030217022.png?imageSlim)

The original `fuwari` theme's article list displayed metadata like category, tags, and publication time. To maintain a cleaner list, I chose to hide these elements.

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503030317637.png?imageSlim)

### Homepage Cover

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250503135534706.png?imageSlim)

The homepage cover image was previously generated using Midjourney, inspired by Chinese ink landscape paintings.

## Conclusion

This migration process gave me a deep appreciation for the maturity and power of modern frontend frameworks. Especially with the assistance of an AI IDE, most of the work no longer required manual coding; instead, pages were built by providing images and clear requirement descriptions.

AI has indeed grown into a capable programming assistant. The debugging and modification process over these two days reminded me of the joy I felt in high school, immersed in writing code and making games at internet cafes.

I hope AI can help us rediscover our initial curiosity. Happy coding!

> The RSS feed address for this site has been updated. Please resubscribe, dear readers!

---

> 💡 Thank you for reading! Feel free to share this article or reach out to me via email to chat.
---
title: Building a Personal Blog with Notion
pubDate: 2023-04-25
lastModDate: 2023-04-25
description: 'The deployment and configuration process for building a personal blog using Notion.'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501042536930.png?imageSlim'
tags: [Business Model, Remote Work, Company Culture, Independent Operation, Innovation, Productivity]
category: 'Design Thinking'
draft: false
lang: en
---

# Introduction

At the beginning of 2023, I decided to change the hosting method for my blog, seeking a more convenient approach. As a heavy Notion user, I discovered [NotionNext](https://github.com/Chacat68/NotionNext).

First, let me introduce NotionNext. It's a static blog built with NextJS + Notion API, supporting multiple deployment options. It requires no server, and setting up a website is very straightforward.

We will use Notion as the database to store articles, Github + Vercel as the management and deployment tools, and NotionNext's code rendering to display our posts, creating a blog website.

So, let's get started!

# 📝 Deployment

## Preparations

### 1. Fork the NotionNext Code

First, prepare your Github and Vercel accounts. Then, go to the NotionNext repository on Github and fork it to your own account.

![202304251333863](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251333863.png)

https://github.com/tangly1024/NotionNext

### 2. Duplicate the Notion Template

Go to the template page below, click the "Duplicate" button, and save the page to your own Notion.

Template: [https://www.notion.so/tanghh/02ab3b8678004aa69e9e415905ef32a5?v=b7eb215720224ca5827bfaa5ef82cf2d&pvs=4](https://www.notion.so/02ab3b8678004aa69e9e415905ef32a5?pvs=21)

![202304251358159](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251358159.png)

In the top-right corner of the saved page, click the "Share" button, enable "Share to web," and copy the web link into your browser's address bar.

![202304251400967](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251400967.png)

Find the Page ID in the browser's address bar, as shown in the image below:

![202304251402932](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251402932.png)

> This image is copied from the official tutorial.

## Start Deployment

After Github finishes forking, go to Vercel and add a new project.

[Dashboard – Vercel](https://vercel.com/dashboard)

![202304251351445](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251351445.png)

Find the NotionNext project and click the "Import" button to deploy.

![202304251352510](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251352510.png)

Click on "Environment Variables" and add a variable named `NOTION_PAGE_ID` with the value being the Page ID obtained in the first step.

![202304251427618](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251427618.png)

Paste the Page ID from the preparation step into the "Value" field and click "Deploy" to start the deployment.

## Deployment Complete

When this page appears, the deployment is complete. Click "Go to Dashboard" to access the website's control panel.

![202304251430344](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251430344.png)

# Other Configurations

## Domain Binding

On the website's control panel page, find the "Settings" page.

![202304251432042](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251432042.png)

Switch to the "Domains" tab, enter your domain, and click the "Add" button. After successful addition, the required IP and server for DNS resolution will appear. Go to your domain management page and set up the DNS records to point to the specified address. Once all configurations are done, wait patiently for the DNS to propagate. Propagation typically takes up to 24 hours, with speed varying.

![202304251435279](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202304251435279.png)

All steps are now complete, and you can quickly access your own blog!

## Configuration Center (Updated June 6th)

If your version is V4.1.0 or later, it supports this configuration page. Some basic website settings can be modified directly here, unlike before when you had to edit `blog.config.js` for them to take effect.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/0c2456f7-0963-462e-bb9b-ede658d017ce/c8a3ecbd-263c-4b96-bf31-f124eb98f4ab/Untitled.png)

Create a new page, go to the template webpage, and copy all the configuration parameters from the template page over!

Template: [https://www.notion.so/tanghh/02ab3b8678004aa69e9e415905ef32a5?v=b7eb215720224ca5827bfaa5ef82cf2d&pvs=4](https://www.notion.so/02ab3b8678004aa69e9e415905ef32a5?pvs=21)

![qKcIrX](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/qKcIrX.png)

## Update (2024/11/30)

For project updates, it is recommended to fork the original project and then create a new branch in your own project for update operations. This way, if conflicts arise during future updates, they won't affect the main project, and only the website project will be modified. You can also create multiple branches to manage multiple websites.

### Create a New Branch

In the original project, create a new branch. Click "View all branches" to enter the branch management interface.

![2024-11-30 at 16.48.14](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-11-30%20at%2016.48.14@2x.png)

After entering the branch management interface, click the "New branch" button, enter the branch name, and the branch will be successfully created.

![2024-11-30 at 16.49.13](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-11-30%20at%2016.49.13@2x.png)

### Version Update

When there is an update in the upstream project, you will see a notification on Github (e.g., "2 commits behind"). You can then click the "Sync fork" button, followed by the "Update branch" button, to automatically update with the upstream version's content.

![2024-11-30 at 16.47.04](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/CleanShot%202024-11-30%20at%2016.47.04@2x.png)

After clicking update, you can see the compilation process for this update in the Vercel backend. Wait for the compilation to complete.

> 💡 Thank you for reading! Feel free to share this article or reach out to me via email to discuss.

> The RSS feed address for this site has been updated. Please resubscribe, dear readers!
---
title: A Journey into AI Tools from Scratch: In-depth Experience and Analysis of Mainstream AI Applications
pubDate: 2023-03-01
lastModDate: 2023-03-01
description: 'Sharing introductory AI experiences, including introductions and usage insights into ChatGPT, Notion with AI, MidJourney, and Stable Diffusion.'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501175820648.png?imageSlim'
tags: [AI, Design, Creation, Tools, Productivity]
category: 'Artificial Intelligence'
draft: false
lang: en
---

## 1. OpenAI and ChatGPT

### 1.1 Introducing ChatGPT

ChatGPT (Chat Generative Pre-trained Transformer) is an AI chatbot program developed by OpenAI, launched in November 2022. The program uses a large language model based on the GPT-3.5 architecture and is trained through reinforcement learning.

ChatGPT currently primarily interacts via text. People can communicate with it using natural language dialogue. Beyond basic capabilities like answering questions, text generation, and summarization, it can also be applied to more complex tasks, such as creating scripts, songs, poetry, business projects, business correspondence, and more.

### 1.2 Features and Limitations

Although ChatGPT can currently converse with us in a tone close to human levels, its core logic is still about mimicking intelligence—polishing data from its training library to converse with us. It provides corresponding answers based on your input questions, making learning how to ask questions a new and important skill.

ChatGPT's training data includes various documents and knowledge about the internet, programming languages, etc., such as BBS forums and Wikipedia. Unlike most other chatbots, ChatGPT can remember previous dialogue content and prompts given by the user. Additionally, to prevent ChatGPT from accepting or generating offensive remarks, input content is filtered by a moderation API to reduce potentially racist or sexist content, among others.

ChatGPT has several limitations. OpenAI acknowledges that ChatGPT "sometimes writes plausible-sounding but incorrect or nonsensical answers," a common issue in large language models known as AI hallucination. Limited by its training data and inability to connect to the internet, ChatGPT knows little about events after 2021. If you seek absolute factual accuracy, your user experience will likely be disappointing.

Algorithmic bias also exists in the training data and manifests in ChatGPT's responses. OpenAI's strategy for this data bias involves using user and internal data reviews to make ChatGPT's answers more aligned with human sensibilities, but this issue cannot be completely resolved in the short term.

### 1.3 Usage Experience

ChatGPT Shortcut

ChatGPT shortcuts that double productivity (The Age of AI - Spellbook)

[ChatGPT Shortcut - An easy-to-use ChatGPT shortcut table to double productivity! | Tag filtering, keyword search, and one-click copy Prompts](https://newzone.top/chatgpt/)

Author's experience sharing:

[I created a "Spell Library" to help you master ChatGPT starting with prompts - SSPAI](https://sspai.com/post/78581)

ChatGPT Chinese Tuning Guide

https://github.com/PlexPt/awesome-chatgpt-prompts-zh

ChatGPT Assistant

You can use examples from the two websites above by inputting similar content in the same chat window, training the AI multiple times from various angles on that topic to help produce more accurate content later.

Record the phrasing of questions asked to the AI as your own personalized magic spells to effectively and precisely generate content.

As a Development Assistant

> I want to create an iOS development project. How should I write the code for the first step?
> 

![iOS Development Project Creation Example](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202302282158717.png)

> This is a countdown-type app. How should I write the logic code?
> 

![Countdown App Logic Code Example](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202302282200636.png)

## 2. Notion and AI

### 2.1 Introducing Notion AI

Notion is a powerful note-taking and task management tool that helps users organize, edit, and share notes, documents, to-do lists, projects, and other information. Notion's main features include customizable pages and templates, embeddable multimedia and third-party applications, and sharing and collaboration capabilities.

The AI functionality in Notion, called Notion AI, helps users quickly solve problems and generate content. Notion AI's main features include text auto-completion, text summarization, duplicate block detection and replacement, table data analysis, keyword extraction, and more. These features can help users complete work faster and improve productivity.

### 2.2 Features and Limitations

The document below is an official Notion guide introducing its AI features. It can help you understand the basic concepts of Notion AI, as well as the current capabilities and limitations of this technology.

[Using Notion AI to extend your impact](https://www.notion.so/help/guides/using-notion-ai)

### 2.3 Usage Experience

The biggest convenience Notion AI brings me is in the execution phase. I no longer need to think about specific steps for crafting text, creating tables, etc. I only need to focus on conceptualizing, while the AI handles the execution.

During the drafting process, I prefer to let Notion AI take over. When I have an idea, I first ask it to help by using the "Write Outline" feature. After seeing the actual text paragraphs, I then consider whether the text is suitable. If not, I immediately try again.

Notion's current official positioning is to help users draft content. Using the "Continue Writing" feature can expand on a topic. The AI-generated text can be modified via Notion AI to polish the wording of each paragraph. I really like the "Improve Writing" and "Fix Spelling & Grammar" features; they make editing articles twice as efficient.

For more Notion AI usage methods, please refer to: [Notion AI --- Notion AI (notion.so)](https://www.notion.so/product/ai)

Pricing:

- As a loyal Notion user, I store all my written content on Notion. Therefore, Notion's AI features are essential for me, greatly improving my work efficiency and reducing the pressure of organizing old articles.
- Currently, free users have a 20-use limit, while paid users have unlimited usage.

## 3. MidJourney

### 3.1 Introducing MidJourney

MidJourney is a generative tool based on AI algorithms that can create paintings based on keywords provided by users. Because it can be used directly on Discord channels without deployment, its low barrier to entry has attracted a large number of users.

Using the recently updated v4 version model, it can produce a wider variety of style images. The image below is from the official reference:

![MidJourney v4 Model](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202302282313956.png)

### 3.2 Usage Experience

> It is recommended for new users to try the free version and join Discord. In public channels, try describing the image in your mind using keywords.
> 

After practicing for a while and becoming familiar with keyword usage, consider paying for a subscription. Choose different pricing tiers based on your usage frequency and intensity. After payment, your personal creations are displayed in the MidJourney Bot window, and others cannot preview your creation process.

> In the MidJourney Bot chat window, type the slash / symbol, select /imagine prompt: keyword + style + parameters
> 

![MidJourney Creation Example](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202302282324801.png)

Each time you create content, the bot presents it as four preview images. You can choose any image to refine or make detailed modifications based on these images.

![MidJourney Creation Example](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/202302282327529.png) 

- U continues refining the current image, V makes detailed variations based on this image.

## 4. Stable Diffusion

### 4.1 Introducing Stable Diffusion

Stable Diffusion is a deep learning model for generating detailed images based on text descriptions. The Stable Diffusion model uses prompts to generate new images, a process often referred to as "guided image synthesis." Additionally, the model allows for partial changes in existing images through prompts for inpainting and outpainting. When used with user interfaces that support these functions, there are many different open-source software options available.

### 4.2 Usage

Text-to-Image

The text-to-image sampling script in Stable Diffusion, called "txt2img," accepts a prompt along with various parameters including sampler type, image dimensions, and random seed, and generates an image file based on the model's interpretation of the prompt.

Image-to-Image

Stable Diffusion includes another sampling script called "img2img," which accepts a prompt, the file path of an existing image, and a denoising strength between 0.0 and 1.0, producing a new image based on the original that also incorporates elements provided in the prompt. Denoising strength indicates the amount of noise added to the output image; higher values result in more changes but may be semantically inconsistent with the provided prompt. Image upscaling is a potential use case for img2img, among others.

### 4.3 Tool Deployment

SD-webui tool: Can be deployed locally, web-based GUI

https://github.com/AUTOMATIC1111/stable-diffusion-webui

Civitai (AI community), where you can find models made by others

[Civitai | Stable Diffusion models, embeddings, hypernetworks and more](https://civitai.com/)

### 4.3 Usage Experience

- DiffusionBee
    - A client for Mac systems, built on the Stable Diffusion model. Website: https://diffusionbee.com/
    - A pre-packaged client with a low barrier to entry.
- Creative Community [ArtHub.ai](https://arthub.ai/)
    - An AI drawing creation community where you can see parameters used by others in their creations.

## References

- ChatGPT Wikipedia: [ChatGPT - Wikipedia, the free encyclopedia (wikipedia.org)](https://zh.wikipedia.org/wiki/ChatGPT)
- Notion AI: [Using Notion AI to extend your impact](https://www.notion.so/help/guides/using-notion-ai)
- MidJourney: [MidJourney](https://www.midjourney.com/)
- Stable Diffusion: [Stable Diffusion](https://www.stable-diffusion.com/)

> 💡 Thank you for reading! Feel free to share the article or contact me to exchange ideas.

> The RSS address for this site has been updated. Please resubscribe, dear readers!
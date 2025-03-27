---
category: blog
coverImage: https://storage.googleapis.com/bgadoci-blog-images/blog-images/images/blog-images/blog-post-images/0c52fc4a-7c88-4dc4-b170-2e993be645c6_1.png
date: '2024-07-30'
excerpt: 'I&#x27;m sharing this short article in case others are trying to solve a
  similar problem. Here is the setup: we’ve created several early and MVP versions
  of some generative AI tools for data.world. Thes...'
slug: using-custom-parameters-in-chat-gpts-custom-gpts-for-metric-tracking
status: published
tags:
- ai
- generative-ai
- ai-operations
- data
- operations
title: Using Custom Parameters in Chat-GPT’s Custom-GPTs for Metric Tracking
---

I'm sharing this short article in case others are trying to solve a similar problem. Here is the setup: we’ve created several early and MVP versions of some generative AI tools for data.world. These tools were either quick Streamlit or React/Node apps that interacted with OpenAI through a detailed system message and a Retrieval-Augmented Generation (RAG) architecture.

The reason we built these apps instead of using Custom-GPTs was twofold. First, I didn’t quite understand how Custom-GPT actions worked and couldn’t find much information online at that time. Second, until recently, you couldn’t opt out of having OpenAI train on your data. Their recent updates to Teams have resolved this, so I started experimenting with how they might work.

It turns out the Actions feature is much more robust than I thought. Simply give it your API spec and specify some parameters in the “instructions,” and it does the rest of the work for you. I was busy trying to figure out where to put filters and parameters in the Actions UI when all you had to do was tell the bot about it in the instructions, and it forms the calls for you. Magical.

![](https://storage.googleapis.com/bgadoci-blog-images/blog-images/images/blog-images/blog-post-images/Screenshot_2024-07-30_at_3.28.23_PM.png)All that worked great. However, when I checked Mixpanel, all the calls to the Vectorizer (middleware where the tracking happened) had a domain of unknown. My code checked the Origin and Referrer to pull the domain out, but nothing was being set for calls coming from Chat-GPT. I tried for a while to get Origin and Referrer into the calls but didn’t get anywhere. Eventually, I figured it out. You can specify in your schema document a property that will show up in the params section. In this case, I called it customGPTId and told my middleware code to look for this if there is no value for Origin or Referrer. It worked like a charm. The end result is I now have metrics around how many times each Custom-GPT I’ve created is hitting my middleware and which APIs it’s using.

![](https://storage.googleapis.com/bgadoci-blog-images/blog-images/images/blog-images/blog-post-images/carbon__3_.png)Learning how to use Actions and track their usage is a very powerful tool for companies looking at implementing AI operations. It will save you a lot of custom builds.
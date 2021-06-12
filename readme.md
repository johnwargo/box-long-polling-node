# Box Long Polling Sample

I was playing around with the [Box](https://box.com) API and created this simple node command line module that exercises the Long Poll API.

Before you run the project, you must first create a Box API project using the instructions [here](https://developer.box.com/guides/applications/custom-apps/jwt-setup/), then obtain a developer token from the project.

Next, clone this repo, then open a terminal window or command prompt to the cloned folder and execute the following commands:

```shell
npm install
node box-long-poll.js <BOX_API_TOKEN>
```

Replacing, of course, `<BOX_API_TOKEN>` with a valid Box API Token for your account.

The app will connect to the Box API using the provided credentials, then display status updates as shown in the following output example:

```shell
D:\dev\node\box-long-polling-exercise>node box-long-poll.js nftHQ2YNx9YPKD9qx888882tjRu5xxcQ
┌──────────────────────────────┐
│                              │
│   Box Long Polling Example   │
│                              │
└──────────────────────────────┘

Realtime URL: https://2.realtime.services.box.net/subscribe?channel=ce9d2975629da355a64a&stream_type=all
Stream position: 18578959106960616

Invoking long poll...
new_change: Change detected
Fetching events...
ITEM_OPEN: db3d441a7065550a949904319b85998740d44768

Invoking long poll...
new_change: Change detected
Fetching events...
ITEM_OPEN: db3d441a7065550a949904319b85998740d44768
ITEM_MODIFY: d28bfd6ce901de3f7594f693016648c3018b8b76

Invoking long poll...
```

Its not the best code I've ever written, but it works, and I learned a few things about using `await` in an infinite loop in nodejs. Obviously there are other ways to write this code as well, but this is all I have to offer you.  

***

You can find information on many different topics on my [personal blog](http://www.johnwargo.com). Learn about all of my publications at [John Wargo Books](http://www.johnwargobooks.com).

If you find this code useful and feel like thanking me for providing it, please consider <a href="https://www.buymeacoffee.com/johnwargo" target="_blank">Buying Me a Coffee</a>, or making a purchase from [my Amazon Wish List](https://amzn.com/w/1WI6AAUKPT5P9).

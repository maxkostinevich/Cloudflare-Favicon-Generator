![fav](https://fav.frontier.workers.dev/)

<hr>

# Serverless Favicon Generator

A simple serverless function which generates a Github-like favicon to be hosted on [Cloudflare Workers](https://workers.cloudflare.com/). Inspired by [Identicon.js](https://github.com/stewartlord/identicon.js)

## Usage

Just add link to function to your website:

```
<link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="https://fav.frontier.workers.dev/"
    />
```

You can also pass the following parameters:

- **hash** - pass this parameter if you'd like to get the same favicon on each request. This is a hashed string (min 15 char length), for example - you may use md5 of your domain name;
- **fg** - hex of foreground color, excluding `#`, e.g. `FF0000`
- **bg** - hex of background color, excluding `#`, e.g. `FF0000`

For example:

```
<link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="https://fav.frontier.workers.dev/?hash=3f07179a07b2a7661e37a3fd0e652a07&fg=1D1F20&bg=F4A15D"
    />
```

## Deploy your own instance

You may deploy this function to your own Cloudflare Workers account.

To do this, make sure [CF Wrangler](https://developers.cloudflare.com/workers/quickstart) is installed and configured on your machine, and run `wrangler publish` in your console.

---

### [MIT License](https://opensource.org/licenses/MIT)

(c) 2020 [Max Kostinevich](https://maxkostinevich.com) - All rights reserved.

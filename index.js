/*
 * Serverless Favicon Generator, hosted on Cloudflare Workers.
 *
 * Learn more at https://maxkostinevich.com/blog/serverless-favicon-generator
 *
 * (c) Max Kostinevich / https://maxkostinevich.com
 */

import { PngPong, createWithMetadata, PngPongShapeTransformer } from "png-pong";

// Utils
const isString = (str) => {
  if (typeof str === "string") {
    return true;
  }
  return false;
};

// Convert Hex to RGB
const hexToRgb = (hex) =>
  hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => "#" + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16));

// Helper function to return PNG response
const PNGResponse = (data, status = 200) => {
  let headers = {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": data.length,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },

    status: status,
  };

  return new Response(data, headers);
};

// Helper function to return JSON response
const JSONResponse = (message, status = 200) => {
  let headers = {
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },

    status: status,
  };

  let response = {
    message: "",
  };

  if (!isString(message)) {
    response = message;
  } else {
    response = {
      message: message,
    };
  }

  return new Response(JSON.stringify(response), headers);
};

addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method === "OPTIONS") {
    event.respondWith(handleOptions(request));
  } else {
    event.respondWith(handle(request));
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function handleOptions(request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers: corsHeaders,
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    });
  }
}

async function handle(request) {
  // Palette sets
  let palettes = [
    [
      // https://coolors.co/ffcdb2-ffb4a2-e5989b-b5838d-6d6875
      [255, 205, 178],
      [255, 180, 162],
      [229, 152, 155],
      [181, 131, 141],
      [109, 104, 117],
    ],
    [
      // https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51
      [38, 70, 83],
      [42, 157, 143],
      [233, 196, 106],
      [244, 162, 97],
      [231, 111, 81],
    ],
    [
      // https://coolors.co/e63946-f1faee-a8dadc-457b9d-1d3557
      [230, 57, 70],
      [241, 250, 238],
      [168, 218, 220],
      [69, 123, 157],
      [29, 53, 87],
    ],
  ];
  try {
    // Get params
    const params = {};
    const url = new URL(request.url);
    const queryString = url.search.slice(1).split("&");

    queryString.forEach((item) => {
      const kv = item.split("=");
      if (kv[0]) params[kv[0]] = kv[1] || true;
    });

    let hash = "",
      bg = "",
      fg = "";

    // Get random palette
    let palette = palettes.splice(
      Math.floor(Math.random() * palettes.length),
      1
    )[0];

    if (params["hash"] && params["hash"].length >= 15) {
      hash = params["hash"];
    } else {
      hash =
        Math.random().toString(36).substr(2) +
        Math.random().toString(36).substr(2);
    }

    if (params["fg"]) {
      fg = hexToRgb("#" + params["fg"]);
    } else {
      fg = palette.splice(Math.floor(Math.random() * palette.length), 1)[0];
    }

    if (params["bg"]) {
      bg = hexToRgb("#" + params["bg"]);
    } else {
      bg = palette.splice(Math.floor(Math.random() * palette.length), 1)[0];
    }

    // Image Config
    const size = 128,
      baseMargin = Math.floor(size * 0.01),
      cell = Math.floor((size - baseMargin * 2) / 5),
      margin = Math.floor((size - cell * 5) / 2),
      image = createWithMetadata(size, size, 30),
      pngPong = new PngPong(image),
      shape = new PngPongShapeTransformer(pngPong);

    for (let i = 0; i < 15; i++) {
      let color = parseInt(hash.charAt(i), 16) % 2 ? bg : fg;
      let offsetX = [],
        offsetY = 0;

      if (i < 5) {
        // Center - by Y-axis
        offsetX = [2];
        offsetY = 0;
      } else if (i < 10) {
        // Center + 1 - by Y-axis
        offsetX = [1, 3];
        offsetY = 5;
      } else if (i < 15) {
        // Center + 2 - by Y-axis
        offsetX = [0, 4];
        offsetY = 10;
      }
      offsetX.forEach((offset) => {
        shape.drawRect(
          offset * cell + margin,
          (i - offsetY) * cell + margin,
          cell,
          cell,
          color
        );
      });
    }

    // Apply drawn pixels
    pngPong.run();

    return PNGResponse(image);
  } catch (err) {
    console.log(err);
    return JSONResponse("Oops! Something went wrong.", 500);
  }
}

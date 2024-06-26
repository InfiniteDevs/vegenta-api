const app = require("express")();
const { v4 } = require("uuid");
const cheerio = require("cheerio");
const cors = require("cors");
const rs = require("request");
const port = 5000;

app.use(cors());

const baseURL = "https://gogoanime3.co/";

app.get("/api/home", (req, res) => {
  let info = {
    details: "https://anime-x.vercel.app/api/details/:id",
    search: "https://anime-x.vercel.app/api/search/:word/:page",
    genre: "https://anime-x.vercel.app/api/genre/:type/:page",
  };
  res.send(info);
});

app.get("/api/details/:id", (req, res) => {
  let results = [];

  siteUrl = `${baseURL}category/${req.params.id}`;
  rs(siteUrl, (err, resp, html) => {
    if (!err) {
      try {
        var $ = cheerio.load(html);
        var type = " ";
        var summary = "";
        var relased = "";
        var status = "";
        var genres = "";
        var Othername = "";
        var title = $(".anime_info_body_bg").children("h1").text();
        var image = $(".anime_info_body_bg").children("img").attr().src;

        $("p.type").each(function (index, element) {
          if ("Type: " == $(this).children("span").text()) {
            type = $(this).text().slice(15, -5);
          } else if ("Plot Summary: " == $(this).children("span").text()) {
            summary = $(this).text().slice(14);
          } else if ("Released: " == $(this).children("span").text()) {
            relased = $(this).text().slice(10);
          } else if ("Status: " == $(this).children("span").text()) {
            status = $(this).text().slice(8);
          } else if ("Genre: " == $(this).children("span").text()) {
            genres = $(this).text().slice(20, -4);
            genres = genres.split(",");
            genres = genres.join(",");
          } else "Other name: " == $(this).children("span").text();
          {
            Othername = $(this).text().slice(12);
          }
        });
        genres.replace(" ");
        var totalepisode = $("#episode_page")
          .children("li")
          .last()
          .children("a")
          .attr().ep_end;
        results[0] = {
          title,
          image,
          type,
          summary,
          relased,
          genres,
          status,
          totalepisode,
          Othername,
        };
        res.status(200).json({ results });
      } catch (e) {
        res.status(404).json({ e: "404 fuck off!!!!!" });
      }
    }
  });
});

app.get("/api/search/:word/:page", (req, res) => {
  let results = [];
  var word = req.params.word;
  let page = req.params.page;
  if (isNaN(page)) {
    return res.status(404).json({ results });
  }

  url = `${baseURL}/search.html?keyword=${word}&page=${req.params.page}`;
  rs(url, (err, resp, html) => {
    if (!err) {
      try {
        var $ = cheerio.load(html);
        $(".img").each(function (index, element) {
          let title = $(this).children("a").attr().title;
          let id = $(this).children("a").attr().href.slice(10);
          let image = $(this).children("a").children("img").attr().src;

          results[index] = { title, id, image };
        });
        res.status(200).json({ results });
      } catch (e) {
        res.status(404).json({ e: "404 fuck off!!!!!" });
      }
    }
  });
});

async function getLink(Link) {
  rs(Link, (err, resp, html) => {
    if (!err) {
      var $ = cheerio.load(html);
      let links = [];
      $("a").each((i, e) => {
        if (e.attribs.download === "") {
          links.push(e.attribs.href);
        }
      });
      return links;
    }
  });
}

app.get("/api/genre/:type/:page", (req, res) => {
  var results = [];
  var type = req.params.type;
  var page = req.params.page;
  if (isNaN(page)) {
    return res.status(404).json({ results });
  }
  url = `${baseURL}genre/${type}?page=${page}`;
  rs(url, (err, resp, html) => {
    if (!err) {
      try {
        var $ = cheerio.load(html);
        $(".img").each(function (index, element) {
          let title = $(this).children("a").attr().title;
          let id = $(this).children("a").attr().href.slice(10);
          let image = $(this).children("a").children("img").attr().src;

          results[index] = { title, id, image };
        });

        res.status(200).json({ results });
      } catch (e) {
        res.status(404).json({ e: "404 fuck off!!!!!" });
      }
    }
  });
});

app.listen(port, () => console.log("running on 5000"));

module.exports = app;

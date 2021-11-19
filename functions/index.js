const functions = require("firebase-functions");

const { GoogleSpreadsheet } = require("google-spreadsheet");
const axios = require("axios");
const express = require("express");

const app = express();

const getCplanes = async () => {
  return await axios({
    method: "GET",
    url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=CPAN&convert=THB",
    headers: { "X-CMC_PRO_API_KEY": "" },
  });
};

exports.scheduledOnePiece = functions.pubsub
  .schedule("every 20 mins")
  .onRun(async () => {
    console.log("checking...");

    // sheet id
    const doc = new GoogleSpreadsheet("");

    await doc.useServiceAccountAuth({
      client_email: "",
      private_key: "",
    });

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    console.log(sheet.title);

    try {
      const price = await getCplanes();
      console.log(price.data.data.CPAN);
      const priceTHB = price.data.data.CPAN.quote.THB.price;

      // const rows = await sheet.getRows();
      // wait for row loaded
      await sheet.loadCells("A88:F88");
      // select cell for update
      const B = sheet.getCellByA1("B88");

      // assign new value that we got from api response
      B.value = priceTHB;
      await sheet.saveUpdatedCells();
    } catch (e) {
      console.log(e);
    }

    return null;
  });

exports.api = functions.https.onRequest(app);

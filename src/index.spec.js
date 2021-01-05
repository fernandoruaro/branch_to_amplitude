const index = require("./index");
const expect = require("chai").expect;
const nock = require("nock");

describe("handler", () => {
  process.env.AMPLITUDE_API_KEY = "api_key";

  const evt = {
    last_attributed_touch_data: {
      $3p: "a_facebook",
      "~advertising_partner_name": "advertising_partner_name",
      "~secondary_publisher": "secondary_publisher",
      "~ad_set_id": "ad_set_id",
      "~ad_name": "ad_name",
      "~feature": "feature",
      "~ad_set_name": "ad_set_name",
      "~campaign_id": "campaign_id",
      "~ad_id": "ad_id",
      "~advertising_account_id": "advertising_account_id",
      "~advertising_partner_id": "advertising_partner_id",
      "~campaign": "campaign",
      "~creative_id": "creative_id",
      "~channel": "channel",
      "~creative_name": "creative_name",
      "~tune_publisher_name": "tune_publisher_name",
      "~ad_objective_name": "ad_objective_name",
      "+click_timestamp": 1608369004,
      "~is_mobile_data_terms_signed": true,
      "+via_features": ["ADS"],
    },
    timestamp: 1608627624761,
    user_data: {
      aaid: "12345678-1234-1234-1234-123456789abc",
    },
    name: "INSTALL",
  };

  it("should map branch events to amplitude", () => {
    expect(index.mapEvent(evt)).to.deep.eq({
      adid: "12345678-1234-1234-1234-123456789abc",
      event_type: "[BRANCH] INSTALL",
      platform: "android",
      user_properties: {
        "[BRANCH] ad_id": "ad_id",
        "[BRANCH] ad_name": "ad_name",
        "[BRANCH] ad_objective_name": "ad_objective_name",
        "[BRANCH] ad_set_id": "ad_set_id",
        "[BRANCH] ad_set_name": "ad_set_name",
        "[BRANCH] advertising_account_id": "advertising_account_id",
        "[BRANCH] advertising_partner_id": "advertising_partner_id",
        "[BRANCH] advertising_partner_name": "advertising_partner_name",
        "[BRANCH] campaign": "campaign",
        "[BRANCH] campaign_id": "campaign_id",
        "[BRANCH] channel": "channel",
        "[BRANCH] creative_id": "creative_id",
        "[BRANCH] creative_name": "creative_name",
        "[BRANCH] feature": "feature",
        "[BRANCH] is_mobile_data_terms_signed": true,
        "[BRANCH] secondary_publisher": "secondary_publisher",
        "[BRANCH] tune_publisher_name": "tune_publisher_name",
      },
    });
  });
  it("should send a post event to amplitude", async () => {
    const scope = nock("https://api2.amplitude.com")
      .post("/attribution")
      .once()
      .reply(200, "success");

    const apiGatewayEvent = {
      body: JSON.stringify(evt),
    };
    await index.handler(apiGatewayEvent);
    expect(scope.isDone()).to.be.true;
  });
});

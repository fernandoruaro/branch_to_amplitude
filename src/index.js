const got = require("got");
const FormData = require("form-data");

const PREFIX = "[Branch]";

exports.mapEvent = (branchEvent) => {
  const userProperties = {};
  if (branchEvent.last_attributed_touch_data) {
    Object.keys(branchEvent.last_attributed_touch_data)
      .filter((i) => i.startsWith("~"))
      .forEach((i) => {
        userProperties[`${PREFIX} ${i.replace("~", "")}`] =
          branchEvent.last_attributed_touch_data[i];
      });
  }
  const event = {
    event_type: `${PREFIX} ${branchEvent.name}`,
    adid: branchEvent.user_data.aaid,
    idfa: branchEvent.user_data.idfa,
    idfv: branchEvent.user_data.idfv,
    user_properties: userProperties,
    platform: branchEvent.user_data.aaid ? "android" : "ios",
  };

  if (!event.adid) {
    delete event.adid;
  }

  if (!event.idfv) {
    delete event.idfv;
  }

  if (!event.idfa) {
    delete event.idfa;
  } else {
    delete event.idfv;
  }

  return event;
};

exports.handler = async (apiGatewayEvent) => {
  try {
    console.log(apiGatewayEvent);
    const branchEvent = JSON.parse(apiGatewayEvent.body);
    console.log(branchEvent);
    if (!branchEvent.last_attributed_touch_data) {
      console.log("last_attributed_touch_data not found. skipping.");
    } else {
      const amplituteEvent = this.mapEvent(branchEvent);
      console.log(amplituteEvent);
      const form = new FormData();
      form.append("api_key", process.env.AMPLITUDE_API_KEY);
      form.append("time", branchEvent.timestamp);
      form.append("event", JSON.stringify(amplituteEvent));
      const { body } = await got.post(
        "https://api2.amplitude.com/attribution",
        {
          body: form,
        }
      );
      console.log(body);
    }

    return {
      statusCode: "200",
      body: JSON.stringify("success"),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

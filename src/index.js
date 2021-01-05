const got = require("got");
const FormData = require("form-data");

const PREFIX = "[BRANCH]";

exports.mapEvent = (evt) => {
  const userProperties = {};
  if (evt.last_attributed_touch_data) {
    Object.keys(evt.last_attributed_touch_data)
      .filter((i) => i.startsWith("~"))
      .forEach((i) => {
        userProperties[`${PREFIX} ${i.replace("~", "")}`] =
          evt.last_attributed_touch_data[i];
      });
  }
  const event = {
    event_type: `${PREFIX} ${evt.name}`,
    adid: evt.user_data.aaid,
    idfa: evt.user_data.idfa,
    user_properties: userProperties,
    platform: evt.user_data.aaid ? "android" : "ios",
  };

  if (!event.adid) {
    delete event.adid;
  }
  if (!event.idfa) {
    delete event.idfa;
  }

  return event;
};

exports.handler = async (evt) => {
  try {
    const form = new FormData();
    form.append("api_key", process.env.AMPLITUDE_API_KEY);
    form.append("time", evt.timestamp);
    form.append("event", JSON.stringify(this.mapEvent(evt)));
    await got.post("https://api2.amplitude.com/attribution", {
      body: form,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};

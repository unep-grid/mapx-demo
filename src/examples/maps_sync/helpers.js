export function updateURL(url, params) {
  const paramsStr = objToParams(params);
  return `${url}?${paramsStr}`;
}

export function objToParams(data) {
  const esc = encodeURIComponent;
  const out = [];

  for (const [key, value] of Object.entries(data)) {

    if (isString(value) && value.startsWith("{") && value.endsWith("}")) {
      out.push(`${esc(key)}=${value}`);
      continue;
    }

    if (isObject(value)) {
      const o = [];
      for (const [k, v] of Object.entries(value)) {
        o.push(`${k}:${v}`);
      }
      out.push(`${esc(key)}=${o.join(";")}`);
      continue;
    }

    out.push(`${esc(key)}=${esc(value)}`);
  }
  return out.join("&");
}

function isObject(item) {
  return !!item && typeof item === "object" && !Array.isArray(item);
}
function isString(str) {
  return typeof str === "string";
}

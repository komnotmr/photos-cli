export const generateUrl = (url, paramsObj) => {
    const paramsQueryString = Object
        .entries(paramsObj)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    if (url.endsWith('/'))
        url = url.substring(0, url.length - 1)

    return `${url}?${paramsQueryString}`;
}

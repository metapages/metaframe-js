// Shared between client and server

export interface Config {
    modules: string[];
}

interface UrlEncodedConfigV1 {
    modules: string[];
}

export const urlToConfig = (url: URL) : Config => {

    // const matches = pathToVersionRegex.exec(url.pathname);
    const version :string | null = url.searchParams.get("v");
    const encodedConfigString :string | null = url.searchParams.get("c");
    // const version :string | undefined = matches?.[1];
    // const encodedConfigString :string | undefined = matches?.[2];
    if (!version || !encodedConfigString) {
        return {modules: []};
    }
    // console.log('matches', matches);
    switch(version) {
        case "1":
            return urlTokenV1ToConfig(encodedConfigString);
        default:
            return {modules: []};
    }
}

export const configToUrl = (url:URL, config: Config) : URL => {
    // On new versions, this will need conversion logic
    url.searchParams.set("v", "1");
    url.searchParams.set("c", btoa(JSON.stringify(config)));
    return url;
    // return urlEncodedConfigV1ToPathString(config);
}

const urlTokenV1ToConfig = (encoded: string) : Config => {
    return JSON.parse(atob(encoded));
}

// const urlEncodedConfigV1ToPathString = (config: UrlEncodedConfigV1) : string => {
//     return `/v1/${btoa(JSON.stringify(config))}`;
// }

// const pathToVersionRegex = /\/(v[0-9]+)\/([a-z-0-9_]+)/;

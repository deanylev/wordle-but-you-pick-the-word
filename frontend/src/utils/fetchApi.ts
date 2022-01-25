const baseUrl = process.env.NODE_ENV === 'development' ? `${window.location.protocol}//${window.location.hostname}:8080` : window.location.origin;

export default function fetchApi(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data: Record<string, unknown> = {}) {
  const url = new URL(`${baseUrl}/api/${endpoint}`);
  const options: Record<string, unknown> = {
    headers: {
      'Content-Type': 'application/json'
    },
    method
  };

  if (method === 'GET') {
    url.search = new URLSearchParams(data as Record<string, string>).toString();
  } else {
    options.body = JSON.stringify(data);
  }

  return fetch(url.toString(), options);
}

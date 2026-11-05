
import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

// API base URL from environment variables.
const BASE_URL = process.env.APP_URL;

// Define the relay service request parameters.
interface RelayServiceParams {
  url: string;
  method?: AxiosRequestConfig["method"];
  headers?: AxiosRequestConfig["headers"];
  data?: AxiosRequestConfig["data"];
}

// Configure and execute the Axios API request.
const relayService = <T = unknown>({
  url,
  method = "GET",
  headers,
  data,
}: RelayServiceParams): Promise<AxiosResponse<T>> => {
  return axios({
    url,
    method,
    baseURL: BASE_URL,
    headers,
    data,
  });
};

export default relayService;

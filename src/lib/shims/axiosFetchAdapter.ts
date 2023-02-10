import axios from "axios";
import fetchAdapter from "axios-fetch-adapter";

axios.defaults.adapter = fetchAdapter;

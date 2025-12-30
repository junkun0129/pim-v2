import { useEffect, useState } from "react";

import { api } from "../api";
import { Series, SeriesOption } from "./types";

export const useSeries = () => {
  const [seriesList, setseriesList] = useState<Series[]>([]);

  const loadSeriesList = async () => {
    const rawList = await api.getSeriesList();
    setseriesList(rawList);
  };

  return { seriesList, loadSeriesList };
};

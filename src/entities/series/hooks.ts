import { useEffect, useState } from "react";

import { api } from "../api";
import { Series } from "./types";

export const useSeries = () => {
  const [seriesList, setseriesList] = useState<Series[]>([]);
  useEffect(() => {
    getList();
  }, []);

  const getList = async () => {
    const rawList = await api.getSeriesList();
    setseriesList(rawList);
  };
  return { seriesList };
};

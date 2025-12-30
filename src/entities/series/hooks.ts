import { useEffect, useState } from "react";

import { api } from "../api";
import { Series, SeriesOption } from "./types";

export const useSeries = () => {
  const [seriesList, setseriesList] = useState<Series[]>([]);
  const [seriesOptionList, setseriesOptionList] = useState<SeriesOption[]>([]);

  useEffect(() => {
    getList();
  }, []);

  async function fetchSeriesOptionList() {
    const rawlist = await api.getSeriesOptionsList();
    setseriesOptionList(rawlist);
  }

  const getList = async () => {
    const rawList = await api.getSeriesList();
    setseriesList(rawList);
  };

  return { seriesList, seriesOptionList, fetchSeriesOptionList };
};

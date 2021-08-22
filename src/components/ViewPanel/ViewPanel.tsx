import { FC, useEffect, useState } from "react";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { useHttp } from "../../hooks/useHttp";
import { useHistory } from "react-router-dom";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import Region from "../Region/Region";
import RegionFromDb from "../RegionFromDb/RegionFromDb";
import { IRegionFromDb } from "../../types/types";
import "./viewPanelStyle.css";

//--------------------------

import dotenv from "dotenv";
dotenv.config();

let APP_API_URL: string | undefined;

if (process.env.NODE_ENV === "production") {
  APP_API_URL = process.env.REACT_APP_PROD_APP_API_URL;
}

if (process.env.NODE_ENV === "development") {
  APP_API_URL = process.env.REACT_APP_DEV_APP_API_URL;
}

//--------------------------

const ViewPanel: FC = () => {
  const {
    viewPanelIsOpened,
    unsavedLayersIsOpened,
    savedLayersIsOpened,
    mapPointer: map,
    currentRegionId,
    onMapRegions,
  } = useTypedSelector((state) => state.app);

  const {
    setUnsavedLayersIsOpenedAction,
    setSavedLayersIsOpenedAction,
    setCurrentRegionIdAction,
    addNewRegionAction,
    setUserIsAuthorizedAction,
  } = useActions();

  //-------------------------

  const { request } = useHttp();
  let history = useHistory();
  const [isLoading, setLoading] = useState(false);
  const [regionsInfo, setRegionsInfo] = useState([]);
  const [reloadingRegionsFromDb, setReloadingRegionsFromDb] = useState(false);

  //-------------------------

  /**
   * it is needed to reload regions from database
   * and it is executed  when 'reloadingRegionsFromDb' variable has value as true
   */
  useEffect(() => {
    if (reloadingRegionsFromDb) {
      setRegionsInfo((state) => []);
      downloadRegionsHandler();
      setReloadingRegionsFromDb((state) => false);
    }
  }, [reloadingRegionsFromDb]);

  //-------------------------

  const unsavedLayersOnClickHandler = () => {
    if (unsavedLayersIsOpened) return;

    setUnsavedLayersIsOpenedAction(!unsavedLayersIsOpened);
    setSavedLayersIsOpenedAction(!savedLayersIsOpened);
  };

  const savedLayersOnClickHandler = () => {
    if (savedLayersIsOpened) return;

    setUnsavedLayersIsOpenedAction(!unsavedLayersIsOpened);
    setSavedLayersIsOpenedAction(!savedLayersIsOpened);
  };

  const createNewRegionHandler = () => {
    let layerGroup: any = L.layerGroup([]);
    layerGroup.addTo(map!);

    addNewRegionAction([
      {
        leaflet_id: layerGroup._leaflet_id,
        regionLayer: layerGroup,
        regionItemInfo: [],
      },
      layerGroup._leaflet_id,
    ]);
  };

  const logOutHandler = async () => {
    let answer: boolean = window.confirm("Do you really want to leave?");
    if (!answer) return;

    let userData: string | null = localStorage.getItem("userData");
    let token: string;

    if (userData) token = JSON.parse(userData).token;
    else {
      alert("Access token has been missed. Log in");
      return;
    }

    try {
      const data = await request(
        APP_API_URL + "/logout",
        "post",
        {},
        { Authorization: `Bearer ${token}` }
      );

      console.log("data= ", data);

      if (data.isError) {
        alert("Error: " + data.message);
      } else if (data.message === "token_deleted") {
        localStorage.removeItem("userData");
        setUserIsAuthorizedAction(false);
      }
    } catch (e) {
      alert("Error: " + e.message);
      throw e;
    }
  };

  //-------------------------

  const downloadRegionsHandler = async () => {
    setLoading((state) => true);

    let userData: string | null = localStorage.getItem("userData");
    let token: string;

    if (userData) token = JSON.parse(userData).token;
    else {
      alert("Access token has been missed. Log in");
      return;
    }

    try {
      const data = await request(
        APP_API_URL + "/get_regions_info",
        "post",
        {},
        { Authorization: `Bearer ${token}` }
      );

      console.log("data= ", data);

      if (data.isError) {
        setLoading((state) => false);
        alert("Error: " + data.message);
      } else if (data.message === "done") {
        setLoading((state) => false);
        setRegionsInfo((state) => data.payload);
      }
    } catch (e) {
      setLoading((state) => false);
      alert("Error: " + e.message);
      throw e;
    }
  };

  //----------------------

  const exportHandler = async () => {
    let answer: boolean = window.confirm("Are you sure you want to export ?");
    if (!answer) return;

    setLoading((state) => true);

    let userData: string | null = localStorage.getItem("userData");
    let token: string;

    if (userData) token = JSON.parse(userData).token;
    else {
      alert("Access token has been missed. Log in");
      return;
    }

    try {
      const data = await request(
        APP_API_URL + "/get_all_regions_geojson",
        "post",
        {},
        { Authorization: `Bearer ${token}` }
      );

      console.log("data= ", data);

      if (data.isError) {
        setLoading((state) => false);
        alert("Error: " + data.message);
      } else if (data.message === "done") {
        if (data.payload.length === 0) {
          alert("There are no regions in the database");
        } else {
          let geoJson: any[] = [];

          data.payload.forEach((obj: any) => {
            geoJson.push(JSON.parse(obj.geo_json));
          });

          console.log("geoJson= ", geoJson);

          let jsonData = JSON.stringify(geoJson);
          let dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(jsonData);
          let datenow = new Date();
          let datenowstr = datenow.toLocaleDateString("en-GB");
          let exportFileDefaultName = "RegionsArray_" + datenowstr + ".geojson";

          let linkElement = document.createElement("a");
          linkElement.setAttribute("href", dataUri);
          linkElement.setAttribute("download", exportFileDefaultName);
          linkElement.click();
        }

        setLoading((state) => false);
      }
    } catch (e) {
      setLoading((state) => false);
      alert("Error: " + e.message);
      throw e;
    }
  };

  //----------------------

  const importHandler = async () => {
    let answer: boolean = window.confirm("Are you sure you want to import ?");
    if (!answer) return;

    let input: HTMLInputElement = document.createElement("input");
    input.setAttribute("type", "file");

    input.addEventListener("change", function () {
      if (input.files!.length === 1) {
        var reader: any = new FileReader();

        //--------------------

        reader.addEventListener("load", async function () {
          var result: any[] = JSON.parse(reader.result);
          console.log("Imported file= ", result);

          if (!Array.isArray(result)) {
            alert("Invalid file data format");
            return;
          }

          if (result.length < 1) {
            alert("There are no regions in the file");
            return;
          }

          if (result[0][1].type === "FeatureCollection") {
            let sending_data: any[] = [];

            result.forEach((arr) => {
              sending_data.push([arr[0], JSON.stringify(arr)]);
            });

            console.log("sending_data= ", sending_data);

            let userData: string | null = localStorage.getItem("userData");
            let token: string;

            if (userData) token = JSON.parse(userData).token;
            else {
              alert("Access token has been missed. Log in");
              return;
            }

            setLoading((state) => true);

            try {
              let body: object = {
                file: sending_data,
              };

              var data = await request(
                APP_API_URL + "/import_regions",
                "post",
                body,
                { Authorization: `Bearer ${token}` }
              );

              console.log("data= ", data);

              if (data.isError) {
                setLoading((state) => false);
                alert("Error: " + data.message);
              } else if (data.message === "done") {
                setLoading((state) => false);
                alert("Regions have saved to database");
              }
            } catch (e) {
              setLoading((state) => false);
              alert("Error: " + e.message);
              throw e;
            }
          } else {
            alert("Invalid geoJson data format");
            return;
          }
        });

        reader.readAsText(input.files![0]);
      } else alert("Select one file");
    });

    input.click();
  };

  //-----------------------

  return (
    <div
      className={
        viewPanelIsOpened ? "a__view-panel a__is-opened" : "a__view-panel"
      }
    >
      <div className="a__top-box">
        <div
          className={
            unsavedLayersIsOpened
              ? "a__unsaved-layers-btn a__active"
              : "a__unsaved-layers-btn"
          }
          title="editing panel"
          onClick={unsavedLayersOnClickHandler}
        >
          <i className="fas fa-map-marked-alt"></i>
        </div>

        <div
          className={
            savedLayersIsOpened
              ? "a__saved-layers-btn a__active"
              : "a__saved-layers-btn"
          }
          title="regions from database"
          onClick={savedLayersOnClickHandler}
        >
          <i className="fas fa-database"></i>
        </div>

        <div
          className={
            unsavedLayersIsOpened
              ? "a__create-region-btn"
              : "a__create-region-btn a__disabled"
          }
          title="create new region"
          onClick={
            currentRegionId > 0
              ? () => {
                  alert("Stop editing of the region");
                }
              : createNewRegionHandler
          }
        >
          <i className="fas fa-plus"></i>
        </div>        

        <div
          className={
            savedLayersIsOpened ? "a__group-btn a__disabled" : "a__group-btn"
          }
          title="group regions"
          onClick={() => alert("it is not implemented")}
        >
          <i className="fas fa-object-group"></i>
        </div>

        <div
          className={
            unsavedLayersIsOpened
              ? "a__download-btn a__disabled"
              : "a__download-btn"
          }
          title="load regions"
          onClick={downloadRegionsHandler}
        >
          <i className="fas fa-download"></i>
        </div>

        <div
          className={
            unsavedLayersIsOpened
              ? "a__export-btn a__disabled"
              : "a__export-btn"
          }
          title="export"
          onClick={exportHandler}
        >
          <i className="fas fa-file-export"></i>
        </div>

        <div
          className={
            unsavedLayersIsOpened
              ? "a__import-btn a__disabled"
              : "a__import-btn"
          }
          title="import"
          onClick={importHandler}
        >
          <i className="fas fa-file-import"></i>
        </div>

        <div
          className={"a__log-out-btn"}
          title="log out"
          onClick={logOutHandler}
        >
          <i className="fas fa-sign-out-alt"></i>
        </div>
      </div>      

      <div
        className={
          unsavedLayersIsOpened
            ? "a__unsaved-layers-container a__active"
            : "a__unsaved-layers-container"
        }
      >
        {onMapRegions.map((o, i) => {
          return <Region obj={o} key={o.leaflet_id} />;
        })}
      </div>

      <div
        className={
          savedLayersIsOpened
            ? "a__saved-layers-container a__active"
            : "a__saved-layers-container"
        }
      >
        <div className={isLoading ? "a__spinner" : "a__spinner a__disabled"}>
          <div>Loading ...</div>
          <div className="lds-dual-ring"></div>
        </div>

        {regionsInfo.map((obj: IRegionFromDb, i: number) => {
          return (
            <RegionFromDb
              info={obj.info}
              uuid={obj.uuid}
              key={obj.uuid}
              reloader={() => setReloadingRegionsFromDb((state) => true)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ViewPanel;

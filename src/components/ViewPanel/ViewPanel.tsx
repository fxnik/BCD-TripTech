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
import { IMapRegion, removeRegionAction } from '../../store/reducers/mapReducer';
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
    addNewRegionAction,
    setUserIsAuthorizedAction,
    CallChangeIndicatorFunctionAction,
    removeRegionItemAction,
    removeRegionAction,
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
        checkedElementsId: [],
        createdAfterCopying: false,
        createdAfterCutting: false,
        createdAfterGrouping: false,
      },
      layerGroup._leaflet_id,
    ]);
  };

  //-------------------

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
          //console.log("Imported file= ", result);

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

            //console.log("sending_data= ", sending_data);

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

  const groupRegions = () => {
    let answer: boolean = window.confirm(
      "Do you really want to group regions?"
    );
    if (!answer) return;

    //---------------

    if (currentRegionId !== -1) {
      alert("Please, stop editing of region");
      return;
    }

    //---------------

    let hasCheckedRegions = false,
      selectedRegionsCounter = 0;

    onMapRegions.forEach((obj: IMapRegion) => {
      if (obj.regionIsChecked) {
        hasCheckedRegions = true;
        selectedRegionsCounter = selectedRegionsCounter + 1;
      }
    });

    if (!hasCheckedRegions || selectedRegionsCounter < 2) {
      alert("Please, select more than one region");
      return;
    }

    //---------------

    let regionGeoJson: any = {
      type: "FeatureCollection",
      features: [],
    };

    let all_layers: any[] = [];

    onMapRegions.forEach((obj: IMapRegion) => {
      if (obj.regionIsChecked) all_layers.push(...obj.regionLayer.getLayers());
    });

    //console.log('layers=', layers)

    if (all_layers.length === 0) {
      alert("Operation is interrupted. The regions have no elements.");
      return;
    }

    //----------------------

    onMapRegions.forEach((obj: IMapRegion) => {
      if (obj.regionIsChecked) {
        let layers: any[] = obj.regionLayer.getLayers();
        let arr: any[] = obj.regionItemInfo;

        for (let i = 0; i < obj.regionItemInfo.length; i++) {
          for (let j = 0; j < layers.length; j++) {
            if (layers[j]._leaflet_id === arr[i][0]) {
              let geo_json = layers[j].toGeoJSON();
              geo_json.properties["information"] = arr[i][1];

              if (layers[j] instanceof L.Circle)
                geo_json.properties["radius"] = layers[j].getRadius();

              regionGeoJson.features.push(geo_json);
            }
          }
        }
      }
    });

    //console.log("regionGeoJson= ", regionGeoJson);

    //--------------

    let original_geo_json: any = regionGeoJson;
    let regionItemInfo: any = [];

    //--------------

    var newLayer = L.geoJSON(original_geo_json, {
      pointToLayer: function (feature, latlng) {
        if (feature.properties.radius) {
          var circle: any = new L.Circle(latlng, feature.properties.radius);
        }
        return circle;
      },

      onEachFeature: function (feature, layer) {},
    });

    let geoJsonLayersArr: any = newLayer.getLayers();

    //console.log("geoJsonLayersArr=", geoJsonLayersArr);

    //-------------

    let layerGroup: any = L.layerGroup([]);
    layerGroup.addTo(map!);

    for (let i = 0; i < geoJsonLayersArr.length; i++) {
      if (geoJsonLayersArr[i].feature.geometry.type === "Polygon") {
        let polygon: any = L.polygon(geoJsonLayersArr[i]._latlngs).addTo(map!);
        polygon.pm._shape = "Polygon";

        regionItemInfo.push([
          polygon._leaflet_id,
          geoJsonLayersArr[i].feature.properties.information,
        ]);

        polygon.on("pm:remove", (event: any) => {
          CallChangeIndicatorFunctionAction();
          removeRegionItemAction(polygon._leaflet_id);
        });

        polygon.on("pm:dragend", (event: any) => {
          CallChangeIndicatorFunctionAction();
        });

        polygon.on("pm:rotateend", (event: any) => {
          CallChangeIndicatorFunctionAction();
        });

        polygon.on("pm:edit", (event: any) => {
          CallChangeIndicatorFunctionAction();
        });

        layerGroup.addLayer(polygon);
      } else if (geoJsonLayersArr[i].feature.geometry.type === "LineString") {
        let polyline: any = L.polyline(geoJsonLayersArr[i]._latlngs).addTo(
          map!
        );
        polyline.pm._shape = "Line";

        regionItemInfo.push([
          polyline._leaflet_id,
          geoJsonLayersArr[i].feature.properties.information,
        ]);

        polyline.on("pm:remove", (event: any) => {
          CallChangeIndicatorFunctionAction();
          removeRegionItemAction(polyline._leaflet_id);
        });

        polyline.on("pm:dragend", (event: any) => {
          CallChangeIndicatorFunctionAction();
        });

        polyline.on("pm:rotateend", (event: any) => {
          CallChangeIndicatorFunctionAction();
        });

        polyline.on("pm:edit", (event: any) => {
          CallChangeIndicatorFunctionAction();
        });

        layerGroup.addLayer(polyline);
      } else if (
        geoJsonLayersArr[i].feature.geometry.type === "Point" &&
        geoJsonLayersArr[i].feature.properties.radius
      ) {
        let circle: any = L.circle(
          geoJsonLayersArr[i]._latlng,
          geoJsonLayersArr[i].feature.properties.radius
        ).addTo(map!);
        circle.pm._shape = "Circle";

        regionItemInfo.push([
          circle._leaflet_id,
          geoJsonLayersArr[i].feature.properties.information,
        ]);

        circle.on("pm:remove", (event: any) => {
          CallChangeIndicatorFunctionAction();
          removeRegionItemAction(circle._leaflet_id);
        });

        circle.on("pm:dragend", (event: any) => {
          CallChangeIndicatorFunctionAction();
        });

        circle.on("pm:edit", (event: any) => {
          CallChangeIndicatorFunctionAction();
        });

        layerGroup.addLayer(circle);
      }
    }

    //----------------------

    let all_info_arr: any[] = onMapRegions.map((obj: IMapRegion) => {
      if (obj.regionIsChecked) return obj.info || "";
    });

    //----------------------

    onMapRegions.forEach((obj: IMapRegion) => {

      if (obj.regionIsChecked) {
        setTimeout(((obj)=>{
          return ()=>{
            obj.regionLayer.remove();
            removeRegionAction(obj.leaflet_id)
          }
        })(obj), 0)
      };

    });

    //----------------------

    addNewRegionAction([
      {
        leaflet_id: layerGroup._leaflet_id,
        regionLayer: layerGroup,
        regionItemInfo: [...regionItemInfo],
        info: all_info_arr.join("") || "Group of regions",
        checkedElementsId: [],
        createdAfterCopying: false,
        createdAfterCutting: false,
        createdAfterGrouping: true,
      },
      layerGroup._leaflet_id,
    ]);

    geoJsonLayersArr.forEach((layer: any) => {
      layer.remove();
    });
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
          onClick={groupRegions}
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

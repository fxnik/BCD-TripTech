import React, { FC, useState, useEffect } from "react";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { useHttp } from "../../hooks/useHttp";
import L from "leaflet";
import { IRegion } from "../../types/types";
import RegionItem from "../RegionItem/RegionItem";
import { IMapRegion } from "../../store/reducers/mapReducer";
import "./regionStyle.css";

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

const Region: FC<IRegion> = ({ obj }) => {
  const {
    mapPointer: map,
    currentRegionId,
    regionHasUnsavedChanges,
    onMapRegions,
  } = useTypedSelector((state) => state.app);

  //-------------------

  const {
    removeRegionAction,
    setCurrentRegionIdAction,
    addNewRegionAction,
    removeRegionItemAction,
    CallChangeIndicatorFunctionAction,
    removeRegionItemsAfterRegionCuttingUpAction,
    setCheckedRegionAction,
    unsetCheckedRegionAction,
  } = useActions();

  //-------------------

  const { request } = useHttp();
  const [isOpend, setIsOpend] = useState(false);
  const [regionInfo, setRegionInfo] = useState("New region");
  const [isNarrowed, setIsNarrowed] = useState(false);
  const [isFromDb, setIsFromBd] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  //-------------------

  /**
   * it runs if region comes from database
   */
  useEffect(() => {
    if (obj.info) {
      setRegionInfo(obj.info);
    }

    if (obj.uuid) {
      setIsFromBd(true);
    }
  }, []);

  //-------------------

  /**
   * it runs for forbidding editing information
   * about region if region is not currently edited
   */
  useEffect(() => {
    if (isOpend) {
      setIsOpend((state) => false);
    }
  }, [currentRegionId]);

  //--------------------

  useEffect(() => {
    if (!isChanged && obj.leaflet_id === currentRegionId) {
      setIsChanged((state) => true);
    }
  }, [regionHasUnsavedChanges]);

  //--------------------

  useEffect(() => {
    if (obj.createdAfterCopying) setIsChanged((state) => true);
    if (obj.createdAfterCutting) setIsChanged((state) => true);
    if (obj.createdAfterGrouping) setIsChanged((state) => true);
  }, []);

  //--------------------

  useEffect(() => {
    if (isChecked) {
      setCheckedRegionAction(obj.leaflet_id);
    } else {
      unsetCheckedRegionAction(obj.leaflet_id);
    }
  }, [isChecked]);

  //--------------------

  const removeRegionHandler = (obj: any) => {
    let answer: boolean = window.confirm(
      "Do you really want to remove this region from the map ?"
    );
    if (!answer) return;

    map!.pm.disableDraw();
    map!.pm.disableGlobalEditMode();
    map!.pm.disableGlobalDragMode();
    map!.pm.disableGlobalRemovalMode();
    map!.pm.disableGlobalCutMode();
    map!.pm.disableGlobalRotateMode();

    obj.regionLayer.remove();
    removeRegionAction(obj.leaflet_id);
  };

  //-------------------

  const setRegionNameHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setIsChanged((state) => true);
    setRegionInfo(event.target.value);
  };

  //-------------------

  const stopRegionEditing = () => {
    let answer: boolean = window.confirm("Do you really want to stop editing?");
    if (!answer) return;

    map!.pm.disableDraw();
    map!.pm.disableGlobalEditMode();
    map!.pm.disableGlobalDragMode();
    map!.pm.disableGlobalRemovalMode();
    map!.pm.disableGlobalCutMode();
    map!.pm.disableGlobalRotateMode();

    setCurrentRegionIdAction(-1);
  };

  //-------------------

  const startRegionEditing = (obj: any) => {
    let answer: boolean = window.confirm(
      "Do you really want to start editing?"
    );
    if (!answer) return;

    setCurrentRegionIdAction(obj.leaflet_id);
  };

  //-------------------

  const saveRegionToDataBaseHandler = async (obj: any) => {
    if (!isChanged) {
      alert("Region has no changes");
      return;
    }

    let answer: boolean = window.confirm(
      "Do you really want to save region to database ?"
    );
    if (!answer) return;

    let userData: string | null = localStorage.getItem("userData");
    let token: string;

    if (userData) token = JSON.parse(userData).token;
    else {
      alert("There is no access token.");
      return;
    }

    //------------------

    try {
      let regionGeoJson: any = {
        type: "FeatureCollection",
        features: [],
      };

      let layers: any[] = obj.regionLayer.getLayers();

      if (layers.length === 0) {
        alert("Operation is interrupted. The region has no elements.");
        return;
      }

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

      //console.log("regionGeoJson= ", regionGeoJson);

      var data: any;

      if (isFromDb) {
        let body: object = {
          uuid: obj.uuid,
          info: regionInfo,
          geo_json: JSON.stringify([regionInfo, regionGeoJson]),
        };

        data = await request(APP_API_URL + "/update_region", "post", body, {
          Authorization: `Bearer ${token}`,
        });
      } else {
        let body: object = {
          info: regionInfo,
          geo_json: JSON.stringify([regionInfo, regionGeoJson]),
        };

        data = await request(APP_API_URL + "/add_region", "post", body, {
          Authorization: `Bearer ${token}`,
        });
      }

      console.log("data= ", data);

      if (data.isError) {
        alert("Error: " + data.message);
      } else if (data.message === "done") {
        setIsChanged((state) => false);
        obj.regionLayer.remove();
        removeRegionAction(obj.leaflet_id);

        alert("Region has saved to database.");
      }
    } catch (e) {
      alert("Error: " + e.message);
      throw e;
    }
  };

  //-------------

  const copyRegionHandler = () => {
    let answer: boolean = window.confirm("Do you really want to copy region ?");
    if (!answer) return;

    let regionGeoJson: any = {
      type: "FeatureCollection",
      features: [],
    };

    let layers: any[] = obj.regionLayer.getLayers();

    if (layers.length === 0) {
      alert("Operation is interrupted. The region has no elements.");
      return;
    }

    //------------

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

    //console.log("regionGeoJson= ", regionGeoJson);

    //---------------

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
          layerGroup.removeLayer(polygon._leaflet_id);
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
          layerGroup.removeLayer(polyline._leaflet_id);
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
          layerGroup.removeLayer(circle._leaflet_id);
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

    addNewRegionAction([
      {
        leaflet_id: layerGroup._leaflet_id,
        regionLayer: layerGroup,
        regionItemInfo: [...regionItemInfo],
        info: "Copy of " + regionInfo,
        checkedElementsId: [],
        createdAfterCopying: true,
        createdAfterCutting: false,
        createdAfterGrouping: false,
      },
      layerGroup._leaflet_id,
    ]);

    geoJsonLayersArr.forEach((layer: any) => {
      layer.remove();
    });
    //--
  };

  //-------------

  const cutRegionHandler = () => {
    let answer: boolean = window.confirm(
      "Do you really want to cut up region ?"
    );
    if (!answer) return;

    //------------

    if (obj.checkedElementsId.length === 0) {
      alert("To cut up region you need to select a few elements");
      return;
    }

    //------------

    let regionGeoJson: any = {
      type: "FeatureCollection",
      features: [],
    };

    let layers: any[] = obj.regionLayer.getLayers();

    if (layers.length === 0) {
      alert("Operation is interrupted. The region has no elements.");
      return;
    }

    //------------

    let buffer: any[] = [];

    for (let i = 0; i < layers.length; i++) {
      for (let j = 0; j < obj.checkedElementsId.length; j++) {
        if (layers[i]._leaflet_id === obj.checkedElementsId[j]) {
          buffer.push(layers[i]);
          break;
        }
      }
    }

    layers = buffer;

    //-------------

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

    //console.log("cut up -- regionGeoJson= ", regionGeoJson);

    //---------------

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

    //console.log("---cut up --- geoJsonLayersArr=", geoJsonLayersArr);

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
          layerGroup.removeLayer(polygon._leaflet_id);
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
          layerGroup.removeLayer(polyline._leaflet_id);
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
          layerGroup.removeLayer(circle._leaflet_id);
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

    addNewRegionAction([
      {
        leaflet_id: layerGroup._leaflet_id,
        regionLayer: layerGroup,
        regionItemInfo: [...regionItemInfo],
        info: "Part of " + regionInfo,
        checkedElementsId: [],
        createdAfterCopying: false,
        createdAfterCutting: true,
        createdAfterGrouping: false,
      },
      layerGroup._leaflet_id,
    ]);

    geoJsonLayersArr.forEach((layer: any) => {
      layer.remove();
    });

    onMapRegions.forEach((obj: IMapRegion) => {
      if (obj.leaflet_id === currentRegionId) {
        obj.checkedElementsId.forEach((_leaflet_id) => {
          obj.regionLayer.removeLayer(_leaflet_id);
        });
      }
    });

    removeRegionItemsAfterRegionCuttingUpAction();

    setIsChanged((state) => true);
  };

  //-------------

  const regionCheckedHandler = () => {
    setIsChecked((state) => !state);
  };

  //-------------

  return (
    <div className="a__region">
      <div className="a__region-header">
        <span className={"a__idicators"}>
          <i
            className={
              obj.leaflet_id === currentRegionId
                ? "fas fa-dot-circle a__active"
                : "fas fa-dot-circle"
            }
            title="currently edited"
          ></i>

          <i
            className={
              isChanged ? "fas fa-dot-circle a__active" : "fas fa-dot-circle"
            }
            title="region has unsaved changes"
          ></i>

          <i
            className={
              isFromDb ? "fas fa-dot-circle a__active" : "fas fa-dot-circle"
            }
            title="loaded from database"
          ></i>
        </span>
        <span>{regionInfo}</span>
      </div>

      <div className={"a__tool-panel"}>
        <div
          className="a__btn a__remove-btn"
          title="remove region from edit panel"
          onClick={() => removeRegionHandler(obj)}
        >
          <i className="fas fa-trash-alt"></i>
        </div>

        <div
          className="a__btn a__pencil-btn"
          title="add information about region"
          onClick={
            obj.leaflet_id === currentRegionId
              ? () => setIsOpend((state) => !state)
              : () => alert("Start editing of this region")
          }
        >
          <i className="fas fa-pencil-alt"></i>
        </div>

        <div
          className="a__btn a__save-btn"
          title="save region to database"
          onClick={
            currentRegionId === -1
              ? () => saveRegionToDataBaseHandler(obj)
              : () => alert("Stop editing of this region.")
          }
        >
          <i
            className="fas fa-save"
            style={
              currentRegionId === -1 ? { color: "green" } : { color: "Brown" }
            }
          ></i>
        </div>

        <div
          className="a__btn a__cut-btn"
          title="cut up region"
          onClick={
            obj.leaflet_id === currentRegionId
              ? cutRegionHandler
              : () => alert("Start editing of this region.")
          }
        >
          <i className="fas fa-cut"></i>
        </div>

        <div
          className="a__btn a__copy-btn"
          title="copy region"
          onClick={
            obj.leaflet_id === currentRegionId
              ? copyRegionHandler
              : () => alert("Start editing of this region.")
          }
        >
          <i className="fas fa-copy"></i>
        </div>

        <div
          className="a__btn a__narrow-btn"
          title={isNarrowed ? "increase frame" : "decrease frame"}
          onClick={() => setIsNarrowed((state) => !state)}
        >
          {isNarrowed ? (
            <i className="fas fa-arrow-down"></i>
          ) : (
            <i className="fas fa-arrow-up"></i>
          )}
        </div>

        <div
          className="a__btn a__start-editing-btn"
          title="start editing"
          onClick={
            currentRegionId === obj.leaflet_id
              ? () => alert("Region is already being edited")
              : currentRegionId === -1
              ? () => startRegionEditing(obj)
              : () =>
                  alert("Access denied. Some region is already being edited")
          }
        >
          <i
            className="fas fa-play"
            style={
              currentRegionId === obj.leaflet_id
                ? { color: "Brown" }
                : currentRegionId === -1
                ? { color: "green" }
                : { color: "Brown" }
            }
          ></i>
        </div>

        <div
          className="a__btn a__stop-editing-btn"
          title="stop editing"
          onClick={
            currentRegionId === obj.leaflet_id
              ? () => stopRegionEditing()
              : () => alert("The region is no longer being edited")
          }
        >
          <i
            className="fas fa-stop"
            style={
              currentRegionId === obj.leaflet_id
                ? { color: "green" }
                : { color: "Brown" }
            }
          ></i>
        </div>

        <div className="a__group-checkbox">
          <input
            type="checkbox"
            onChange={regionCheckedHandler}
            title="select this region to group"
            disabled={currentRegionId === -1 ? false : true}
          />
        </div>
      </div>

      <div className={isOpend ? "a__comments a__opened" : "a__comments"}>
        <span>Information:</span>
        <textarea value={regionInfo} onChange={setRegionNameHandler} rows={3} />
      </div>

      <div
        className={
          isNarrowed ? "a__region-items a__narrowed" : "a__region-items"
        }
      >
        {obj.regionLayer.getLayers().map((layer: any, i: number) => {
          let new_arr: any[] = obj.regionItemInfo.filter((arr) => {
            return arr[0] === layer._leaflet_id;
          });

          return (
            <RegionItem
              layer={layer}
              key={layer._leaflet_id}
              info={new_arr[0] ? new_arr[0] : undefined}
              region_id={obj.leaflet_id}
              signaler={() => setIsChanged((state) => true)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Region;

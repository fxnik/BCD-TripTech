import { FC, useState } from "react";
import { IRegionFromDb, IDataBaseRegionModel } from "../../types/types";
import { useHttp } from "../../hooks/useHttp";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./regionFromDbStyle.css";

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

const RegionFromDb: FC<IRegionFromDb> = ({ info, uuid, reloader }) => {
  const { mapPointer: map } = useTypedSelector((state) => state.app);
  const {
    addNewRegionAction,
    removeRegionItemAction,
    CallChangeIndicatorFunctionAction,
  } = useActions();

  const { request } = useHttp();
  const [isLoading, setLoading] = useState(false);

  //--------------------

  const deleteRegionFromDbHandler = async () => {
    let answer: boolean = window.confirm(
      "Are you sure you want to remove the region from the database ?"
    );
    if (!answer) return;

    let userData: string | null = localStorage.getItem("userData");
    let token: string;

    if (userData) token = JSON.parse(userData).token;
    else {
      alert("Access token has been missed. Log in");
      return;
    }

    try {
      let body: object = {
        uuid: uuid,
      };

      const data = await request(APP_API_URL + "/delete_region", "post", body, {
        Authorization: `Bearer ${token}`,
      });

      console.log("data= ", data);

      if (data.isError) {
        alert("Error: " + data.message);
      } else if (data.message === "done") {
        alert("Region has been removed from database.");
        reloader();
      }
    } catch (e) {
      alert("Error: " + e.message);
      throw e;
    }
  };

  //------------------------

  const editRegionFromDbHandler = async () => {
    let answer: boolean = window.confirm(
      "Are you sure you want to edit the region ?"
    );
    if (!answer) return;

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
        uuid: uuid,
      };

      var data = await request(APP_API_URL + "/get_one_region", "post", body, {
        Authorization: `Bearer ${token}`,
      });

      console.log("data= ", data);

      setLoading((state) => false);

      if (data.isError) {
        alert("Error: " + data.message);
      } else if (data.message === "done") {
        console.log("done");
        regionBuilder(data.payload);
      }
    } catch (e) {
      setLoading((state) => false);
      alert("Error: " + e.message);
      throw e;
    }
  };

  //----------------------

  const regionBuilder = (payload: IDataBaseRegionModel) => {
    let original_json = JSON.parse(payload.geo_json);
    let original_geo_json = original_json[1];
    let featuresArr = original_geo_json.features;

    //console.log("original_geo_json=", original_geo_json);
    //console.log("featuresArr=", featuresArr);

    let regionItemInfo: any = [];

    //-----------------------

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

    //---------------------

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

    addNewRegionAction([
      {
        leaflet_id: layerGroup._leaflet_id,
        regionLayer: layerGroup,
        regionItemInfo: [...regionItemInfo],
        uuid: payload.uuid,
        info: original_json[0],
      },
      layerGroup._leaflet_id,
    ]);

    geoJsonLayersArr.forEach((layer: any) => {
      layer.remove();
    });
  };

  //--------------------

  return (
    <div className="a__region-from-db">
      <div className={isLoading ? "a__spinner" : "a__spinner a__disabled"}>
        <div>Loading ...</div>
        <div className="a__lds-dual-ring"></div>
      </div>

      <textarea
        value={info}
        onChange={() => {
          return;
        }}
      />

      <div className="a__tool-panel">
        <div
          className="a__btn a__remove-btn"
          title="remove region from database"
          onClick={deleteRegionFromDbHandler}
        >
          <i className="fas fa-trash-alt"></i>
        </div>

        <div
          className="a__btn a__edit-btn"
          title="edit region"
          onClick={editRegionFromDbHandler}
        >
          <i className="fas fa-wrench"></i>
        </div>
      </div>
    </div>
  );
};

export default RegionFromDb;

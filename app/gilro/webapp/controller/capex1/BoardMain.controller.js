sap.ui.define([
    "gilro/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, JSONModel, Fragment, Sorter, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("gilro.controller.capex1.BoardMain", {

        // 라이프 사이클
		onInit: function () {
            console.clear();
            console.log(" === BoardMain onInit === ");
      
        }




        
	});
});
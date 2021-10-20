sap.ui.define([
	"gilro/controller/BaseController",
], function (Controller) {
	"use strict";

	return Controller.extend("gilro.controller.App", {

		onInit: function () {

		},

    handleUserNamePress: function () {
      
    },


    onItemSelect: function (oEvent) {
      const sKey = oEvent.getParameter('item').getKey();
      this.getRouter().navTo(sKey);
    },

		onSideNavButtonPress: function () {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(bSideExpanded);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		_setToggleButtonTooltip: function (bLarge) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				oToggleButton.setTooltip('Large Size Navigation');
			} else {
				oToggleButton.setTooltip('Small Size Navigation');
			}
		}

	});
});
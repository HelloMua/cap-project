sap.ui.define([
	"sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller) {
		"use strict";

		return Controller.extend("gilro.controller.capex1.BoardDetail", {
			onInit: function () {
                //페이지 갱신될 때 실행되는 함수 호출
                let Detail = this.getOwnerComponent().getRouter().getRoute("BoardDetail");
                let fullDetail = this.getOwnerComponent().getRouter().getRoute("BoardDetailFull");

                Detail.attachPatternMatched(this.onMyRoutePatternMatched, this);
                fullDetail.attachPatternMatched(this.onMyRoutePatternMatched2, this);

            },

            // 투컬럼 페이지 매칭 시 발동
            onMyRoutePatternMatched: function () {
                this.byId("fullScreen").setVisible(true);
                this.byId("exitScreen").setVisible(false);
            },

            // 풀스크린 페이지 매칭 시 발동
            onMyRoutePatternMatched2: function () {
                this.byId("fullScreen").setVisible(false);
                this.byId("exitScreen").setVisible(true);
            },

            // 스크린 확장
            onFull: function () {
                this.getOwnerComponent().getRouter().navTo("BoardDetail");
            },

            // 스크린 축소
            onExitFull: function () {
                this.getOwnerComponent().getRouter().navTo("BoardDetailFull");
            },

            // 돌아가기
            onBack: function () {
                this.getOwnerComponent().getRouter().navTo("BoardMain");
            }
		});
	});
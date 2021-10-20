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

            var oViewModel = new JSONModel([]);
            this.getView().setModel(oViewModel, "products");
      
        },

        onBack: function () {
            this.getOwnerComponent().getRouter().navTo("BoardMain");
        },

        // 상세 페이지 라우팅
        onRoutePage: function (oEvent) {
            var poNum = oEvent.getSource().getCells()[0].getText();

            this.getOwnerComponent().getRouter().navTo("BoardDetail", {
                num : poNum
            })
        },

        addRow: function () {
            this.getView().getModel("products").getProperty("/").push({});
            this.getView().getModel("products").refresh(true);
     
        },

        // ajax를 사용하여 데이터 가져오기
        _getData: (Path) => {
            return new Promise((resolve) => {
                $.ajax({
                    type: "get",
                    async: false,
                    url: Path,
                    success: function (Data) {
                        resolve(Data)
                    },
                    error: function (xhr, textStatus, errorMessage) {
                        alert(errorMessage)
                    },
                })
            })
        },

        // Dialog에서 Search Button 눌렀을 때 실행
        onSearchAuthors : function () {
            this._getAuthorsSelect();
        },

        // Authors 데이터 가져오기 
        _getAuthorsSelect : function () {
            let AuthorsPath = "/catalog/Authors"
            this._getData(AuthorsPath).then((oData) => {
                var oAuthorsModel = new JSONModel(oData.value)
                console.log(oAuthorsModel);
                this.getView().setModel(oAuthorsModel, "AuthorsSelect");
            })
        },

        // BoardMain.view에서 Author 헬프 박스 버튼 눌렀을 때 실행
        handleTableSelectDialogPress: function () {
            var oAuthorModel = new JSONModel()
            this.getView().setModel(oAuthorModel, "AuthorsSelect");
            this.onAuthorDialogOpen("AuthorsSelect")
        },

        //다이얼로그 창 생성
        onAuthorDialogOpen: function () {
            var oView = this.getView();

            if(!this.AuthorsDialog) {
                this.AuthorsDialog = Fragment.load({
                    id: oView.getId(),
                    name: "gilro.view.fragment.AuthorsSelect",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this.AuthorsDialog.then(function(oDialog) {
                oDialog.open();

                oDialog.attachAfterOpen(function(){

                });
            });
        }
	});
});
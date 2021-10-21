sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/richtexteditor/RichTextEditor",
    "sap/ui/model/json/JSONModel"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, RichTextEditor, JSONModel) {
        "use strict";
        let _this;
        let _param;
        let _data;

		return Controller.extend("gilro.controller.capex1.BoardDetail", {
			onInit: function () {
                // 페이지 갱신될 때 실행되는 함수 호출
                let Detail = this.getOwnerComponent().getRouter().getRoute("BoardDetail");
                let fullDetail = this.getOwnerComponent().getRouter().getRoute("BoardDetailFull");

                Detail.attachPatternMatched(this.onMyRoutePatternMatched, this);
                fullDetail.attachPatternMatched(this.onMyRoutePatternMatched2, this);

                // 풀스크린 및 에딧 모드 변환값
                const oViewModel = new JSONModel({full : true});
                this.getView().setModel(oViewModel, "orDetailView");

                // Rich Text Editor을 VerticalLayout에 추가하기 
                this.getView().byId("editor").addContent(this.oEditor.oRichTextEditor);

                // Books Entity의 데이터를 가져와서 JSON Model을 생성하고 담는다
                // let BooksPath = "/catalog/Books"

                // this._getData(BooksPath).then((oData) => {
                //     var oBooksModel = new JSONModel(oData.value)
                //     // console.log(oBooksModel);
                //     this.getView().setModel(oBooksModel, "BooksSelect");
                // }) 

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

            // 투컬럼 페이지 매칭 시 발동
            onMyRoutePatternMatched: function (oEvent) {
                this.byId("fullScreen").setVisible(true);
                this.byId("exitScreen").setVisible(false);
                _data = this.getView().getModel("orDetailView");
                _this = this;
                _param = oEvent.getParameter("arguments").num;

                this.selectList();
            },

            // 풀스크린 페이지 매칭 시 발동
            onMyRoutePatternMatched2: function (oEvent) {
                this.byId("fullScreen").setVisible(false);
                this.byId("exitScreen").setVisible(true);
                _data = this.getView().getModel("orDetailView");
                _this = this;
                _param = oEvent.getParameter("arguments").num;

                this.selectList();
            },

            // 스크린 확장
            onFull: function () {
                if (_param === undefined) {
                    _this.getOwnerComponent().getRouter().navTo("BoardDetailFull");
                } else {
                    _this.getOwnerComponent().getRouter().navTo("BoardDetailFull", {num: _param});
                }
            },

            // 스크린 축소
            onExitFull: function () {
                if (_param === undefined) {
                    _this.getOwnerComponent().getRouter().navTo("BoardDetail");
                } else {
                    _this.getOwnerComponent().getRouter().navTo("BoardDetail", {num: _param});
                }
            },

            // 돌아가기
            onBack: function () {
                this.getOwnerComponent().getRouter().navTo("BoardMain");

                // 다시 main page로 돌아올 때 검색창 띄우는 방법???
                // main.getView().byId("page").setHeaderExpanded(true);
            },

            // Rich Text Editor 
            oEditor: {
                oRichTextEditor: new RichTextEditor("myRTE", {
                    editorType: sap.ui.richtexteditor.EditorType.TinyMCE4,
                    width: "100%",
                    height: "600px",
                    customToolbar: true,
                    showGroupFont: true,
                    showGroupLink: true,
                    showGroupInsert: true,
                    value: "{detail>/ploat}",
                    editable: false,
                    ready: function () {
                        this.addButtonGroup("styleselect").addButtonGroup("table");
                    }
                })
            },

            selectList: async function () {
                let list = await this.select("/catalog/Books?$expand=author");
                console.log(list);

                let aSelectedList = list.value;
                let data;
                for (let i in aSelectedList) {
                    if (aSelectedList[i].ID === _param) {
                        data = aSelectedList[i];
                    }
                }
                
                this.getView().setModel(new JSONModel(data), "detail");
            },

            // 데이터 조회
            select : function (url) {
                return $.ajax({
                    type: "get",
                    url: url
                })
            }
		});
	});
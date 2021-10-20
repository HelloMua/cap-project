sap.ui.define([
    "gilro/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"
], function (Controller, Filter, FilterOperator, JSONModel, Fragment, Sorter, MessageBox, MessageToast, Spreadsheet, exportLibrary) {
    "use strict";
    const EdmType = exportLibrary.EdmType;

	return Controller.extend("gilro.controller.capex1.BoardMain", {

        // 라이프 사이클
		onInit: function () {
            console.clear();
            console.log(" === BoardMain onInit === ");

            var oViewModel = new JSONModel([]);
            this.getView().setModel(oViewModel, "products");

            this._getBooksSelect();            
      
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

        // 가져온 Authors 데이터를 BoardMain.view에서 Author 헬프 박스 버튼 눌렀을 때 나오게끔 실행
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
        },

        // 테이블 검색 버튼
        onSearch: function () {
            this._getBooksSelect();
        },

        // Books 데이터 가져오기
        _getBooksSelect: function () {
            let BooksPath = "/catalog/Books"
            this._getData(BooksPath).then((oData) => {
                var oBooksModel = new JSONModel(oData.value)
                console.log(oBooksModel);
                this.getView().setModel(oBooksModel, "BooksSelect");
            })

        },

        // Input 초기화 버튼 클릭 시 실행
        onReset: function () {
            this.getView().byId("id").setValue("");
            this.getView().byId("author").setValue("");
            this.getView().byId("title").setValue("");
        },

        // Excel 파일 생성
        onDataExport: function () {
            // console.log(this.byId("Table").getBinding("items"));
            if (this.byId("table").getBinding("items") === undefined) {
                MessageBox.alert("리스트를 먼저 조회해주세요.");
                return;
            }

            let aCols, oRowBinding, oSettings, oSheet, oTable;
    
            if (!this._oTable) {
                this._oTable = this.byId("table");
            }

            oTable = this._oTable;
            oRowBinding = oTable.getBinding("items");
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'BooksList.xlsx',
                worker: false
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function() {
                oSheet.destroy();
            });
        },
        
        createColumnConfig: function() {
            const aCols = [];

            aCols.push({
                property: 'ID',
                type: EdmType.String
            });

            aCols.push({
                property: 'name',
                type: EdmType.String
            });

            return aCols;
        },

        onFilter: function () {

        },

        // 라디오 버튼 클릭 시 실행
        onChaneSelect: function (oEvent) {
            this.oText = oEvent.getParameters().listItem.getAggregation("cells")[1].getProperty("text");
            console.log(this.oText);
        },

        // Dialog의 선택 버튼 클릭 시, 추출한 값을 Input Box에 넣고 창 닫기
        onSelectAuthors: function () {
            this.getView().byId("author").setValue(this.oText);
            this.getView().byId("AuthorsFrag").close();
        },

        // Dialog의 취소 버튼 클릭 시 창 닫기
        onCloseAuthorsFrag: function () {
            this.getView().byId("AuthorsFrag").close();
        }
	});
});
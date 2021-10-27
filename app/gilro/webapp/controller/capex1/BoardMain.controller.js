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
            // console.clear();
            console.log(" === BoardMain onInit === ");

            // Books Entity의 데이터를 가져와서 JSON Model을 생성하고 담는다
            this.onSearch2();
            
            // 테이블의 개수를 담는 모델 생성
            const oCountModel = new JSONModel({count: 0});
            this.getView().setModel(oCountModel, "co");

            // 페이지 갱신될때 실행되는 함수 호출
            const myRoute = this.getOwnerComponent().getRouter().getRoute("BoardMain");
            myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);

        },

        onMyRoutePatternMatched: async function () {
            this._getBooksSelect();
        },

        onBack: function () {
            this.getOwnerComponent().getRouter().navTo("Home");
        },

        // 상세 페이지 라우팅
        onRoutePage: function (oEvent) {
            var poNum = oEvent.getSource().getCells()[0].getText();

            this.getOwnerComponent().getRouter().navTo("BoardDetail", {
                num: poNum
            });
    
            this.getView().byId("page").setHeaderExpanded(false);
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
        onSearchAuthors : function (oEvent) {
            let searchField = this.byId("AuthorsSearch").getValue();
            // console.log(searchField);

            if (searchField === undefined || searchField === "") {
                // 서치필드에 빈 값을 입력했을 때 전체 데이터가 나오게 함
                this._getAuthorsSelect();
            } else {
                // 서치필드에 입력한 값에 해당하는 데이터만 나오게 함
                var aFilters = [];
                var sQuery = oEvent.getSource().getValue();

                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter("name", FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                }

                // update list binding
                var oTable = this.byId("AuthorsSelectTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilters);
                // console.log(oBinding);
            }

        },

        // Authors 데이터 가져오기 
        _getAuthorsSelect : function () {
            let AuthorsPath = "/catalog/Authors"

            this._getData(AuthorsPath).then((oData) => {
                var oAuthorsModel = new JSONModel(oData.value)
                // console.log(oAuthorsModel);
                this.getView().setModel(oAuthorsModel, "AuthorsSelect");
            })
        },

        // 가져온 Authors 데이터를 InputBox안에 넣고 오른쪽 네모두개모양 버튼 누르면 다이얼로그 창 생성
        handleTableSelectDialogPress: function (oEvent) {
            var oAuthorModel = new JSONModel()
            this.getView().setModel(oAuthorModel, "AuthorsSelect");

            this.onAuthorDialogOpen("AuthorsSelect");
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

        // onLiveChange: function (oEvent) {
        //     // add filter for search
        //     var aFilters = [];
        //     var sQuery = oEvent.getSource().getValue();

        //     if (sQuery && sQuery.length > 0) {
        //         var filter = new Filter("name", FilterOperator.Contains, sQuery);
        //         aFilters.push(filter);
        //     }

        //     // update list binding
        //     var oTable = this.byId("AuthorsSelectTable");
        //     var oBinding = oTable.getBinding("items");
        //     oBinding.filter(aFilters);
        //     console.log(oBinding);
            
        // },

        // 테이블 검색 버튼
        onSearch2: function () {
            console.log("+++++++++");
            this._getBooksSelect();
        },

        // Books 데이터 가져오기
        _getBooksSelect: function () {
            console.log("=========");
            let BooksPath = "/catalog/Books?$expand=author"

            this._getData(BooksPath).then((oData) => {
                var oBooksModel = new JSONModel(oData.value)
                // console.log(oBooksModel);
                this.getView().setModel(oBooksModel, "BooksSelect");

                let oBinding = this.byId("table").getBinding("items");

                if (oBinding != undefined && oBinding.aIndices != undefined) {
                    this.getView().getModel("co").setProperty("/count", oBinding.aIndices.length);
                }
            })
        },

        // Input 초기화 버튼 클릭 시 실행
        onReset: function () {
            this.getView().byId("id").setValue("");
            this.getView().byId("author").setValue("");
            this.getView().byId("title").setValue("");
        },

        // InputBox 3개 동시 검색하기
        onSearch: function () {
            console.log("----------");
            let idValue = this.getView().byId("id").getValue();
            let authorValue = this.getView().byId("author").getValue();
            let titleValue = this.getView().byId("title").getValue();

            let oTable = this.byId("table");

            // 검색바 입력에 맞는 조건들의 배열
            this._aTableSearchState  = [];
            
            // 검색바 입력에 따라 조건 처리
            let aIdFilter = [new Filter({path: "ID", operator: FilterOperator.Contains, value1: idValue, caseSensitive: false})];
            let aAuthorFilter = [new Filter({path: "author/name", operator: FilterOperator.Contains, value1: authorValue, caseSensitive: false})];
            let aTitleFilter = [new Filter({path: "title", operator: FilterOperator.Contains, value1: titleValue, caseSensitive: false})];

            // 여러 개의 검색조건 선택값에 따라 조건 처리
            this._aTableSearchState.push(new Filter({filters: aIdFilter}));
            this._aTableSearchState.push(new Filter({filters: aAuthorFilter}));
            this._aTableSearchState.push(new Filter({filters: aTitleFilter}));

            oTable.getBinding("items").filter(this._aTableSearchState);

            // if (oTable.getBinding("items").length !== 0) {
            //     oViewModel.setProperty("/tableNoDataText", "데이터가  없습니다.");
            // }

            // 테이블의 개수를 가져와서 JSJON Model에 넣어주기
            let oBinding = this.byId("table").getBinding("items");

            if (oBinding != undefined && oBinding.aIndices != undefined) {
                this.getView().getModel("co").setProperty("/count", oBinding.aIndices.length);
            }

            // this.getView().setModel(oBooksModel, "BooksSelect");
            
        },

        // Excel 파일 생성
        onDataExport: function () {
            // console.log(this.byId("Table").getBinding("items"));

            if (this.byId("table").getBinding("items") === undefined) {
                MessageBox.alert("리스트를 먼저 조회해주세요.");
                this.byId("excel").setBlocked(false);
                return;
            }

            let aCols, oRowBinding, oSettings, oSheet, oTable;
    
            if (!this.oTable) {
                this.oTable = this.byId("table");
            }

            oTable = this.oTable;
            // console.log(oTable);
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
        },

        // 필터링(정렬)
        onFilter: function () {
            this.onBooksOpenSettings();
        },

        onBooksOpenSettings: function () {
            const sDialogTab = "filter";

            if (!this.byId("filter")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "gilro.view.fragment.Filter",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    oDialog.open(sDialogTab);
                }.bind(this));
            } else {
                this.byId("filter").open(sDialogTab);
            }
        },

        // ????
        resetGroupDialog: function () {
            this.groupReset = true;
        },

        // Filter Dialog의 확인 버튼 클릭 시 실행
        onConfirmOrderDialog: function (oEvent) {
            let mParams = oEvent.getParameters();       // 해당 이벤트가 발생한 시점의 정보 (filter, group, sort의 정보를 모두 가지고 있음)
            let oBinding = this.byId("table").getBinding("items");      // table의 items 컬럼들값 (테이블의 행 정보) 

            // 정렬화
            let sPath = mParams.sortItem.getKey();      // fragment.xml에서 지정한 sortItems의 key값
            let bDescending = mParams.sortDescending;   // default value=> false

            let aSorters = [];
            aSorters.push(new Sorter(sPath, bDescending));      // sortItems의 key값들을 오름차순으로 정렬할 배열 
            oBinding.sort(aSorters);        // 행을 정렬할 때 aSorters 배열을 가져와서 담음

            // 테이블의 개수를 가져와서 JSJON Model에 넣어주기
            if (oBinding != undefined && oBinding.aIndices != undefined) {
                // 행의 갯수를 담는 로직
                this.getView().getModel("co").setProperty("/count", oBinding.aIndices.length);
            }
        },

        // 도서 등록 페이지
        onCreate: function () {
            this.getOwnerComponent().getRouter().navTo("BoardCreate");
        }
	});
});
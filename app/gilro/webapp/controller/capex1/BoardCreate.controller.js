sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/richtexteditor/RichTextEditor",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/m/MessageToast"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, RichTextEditor, JSONModel, Fragment, Filter, FilterOperator, MessagePopover, MessageItem, MessageToast) {
        "use strict";
        var oMessagePopover;

		return Controller.extend("gilro.controller.capex1.BoardCreate", {
			onInit: function () {
                // Rich Text Editor을 VerticalLayout에 추가하기 
                this.getView().byId("editor").addContent(this.oEditor.oRichTextEditor);

                // MessageTemplage 만들기
                var oMessageTemplate = new MessageItem({
                    type: '{type}',
                    title: '{title}',
                    activeTitle: "{active}",
                    description: '{description}',
                    subtitle: '{subtitle}',
                    counter: '{counter}',
                    link: ''
                });

                var aMockMessages = [{
                    type: 'Error',
                    title: 'Error message',
                    active: true,
                    description: 'First Success message description',
                    subtitle: 'Example of subtitle',
                    counter: 1
                }, {
                    type: 'Warning',
                    title: 'Warning without description',
                    description: ''
                }, {
                    type: 'Success',
                    title: 'Success message',
                    description: 'First Success message description',
                    subtitle: 'Example of subtitle',
                    counter: 1
                }, {
                    type: 'Error',
                    title: 'Error message',
                    description: 'Second Error message description',
                    subtitle: 'Example of subtitle',
                    counter: 2
                }, {
                    type: 'Information',
                    title: 'Information message',
                    description: 'First Information message description',
                    subtitle: 'Example of subtitle',
                    counter: 1
                }];

                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);

                // Message Popover 만들기
                oMessagePopover = new MessagePopover({
                    items: {
                        path: '/',
                        template: oMessageTemplate
                    },
                    activeTitlePress: function () {
                        MessageToast.show("미정");
                    }
                });

                this.byId("messagePopoverBtn").addDependent(oMessagePopover);
            },

            // 뒤로가기 (메인페이지로 이동)
            onBack: function () {
                this.getOwnerComponent().getRouter().navTo("BoardMain");
            },

            // Rich Text Editor 
            oEditor: {
                oRichTextEditor: new RichTextEditor("myRTE2", {
                    editorType: sap.ui.richtexteditor.EditorType.TinyMCE4,
                    width: "100%",
                    height: "600px",
                    customToolbar: true,
                    showGroupFont: true,
                    showGroupLink: true,
                    showGroupInsert: true,
                    value: "",
                    editable: true,
                    ready: function () {
                        this.addButtonGroup("styleselect").addButtonGroup("table");
                    }
                })
            },

            // InputBox안에 ValueHelp 버튼 누르면 다이얼로그 창 생성
            handleTableSelectDialogPress: function () {
                var oAuthorModel = new JSONModel()
                this.getView().setModel(oAuthorModel, "AuthorsSelect");

                this.onAuthorDialogOpen("AuthorsSelect");
            },

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

            // Dialog에서 Search Button 눌렀을 때 실행
            onSearchAuthors: function (oEvent) {
                let searchField = this.byId("AuthorsSearch").getValue();

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
            _getAuthorsSelect: function () {
                let AuthorsPath = "/catalog/Authors"

                this._getData(AuthorsPath).then((oData) => {
                    var oAuthorsModel = new JSONModel(oData.value)
                    // console.log(oAuthorsModel);
                    this.getView().setModel(oAuthorsModel, "AuthorsSelect");
                })

            },

            // ajax를 사용하여 데이터 가져오기
            _getData: function (Path) {
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

            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            },

            buttonIconFormatter: function () {

            },

            buttonTypeFormatter: function () {

            },

            highestSeverityMessages: function () {

            },

            onBarSave: function () {
                var authorInput = this.getView().byId("author");
                var titleInput = this.getView().byId("title");
                var stockInput = this.getView().byId("stock");
                var editorInput = this.getView().byId("editor");

                if (!authorInput.getValue()) {
                    authorInput.setValueState("Error");
                    authorInput.setValueStateText("저자를 제대로 입력해주세요.");
                    authorInput.focus();
                }

                if (!titleInput.getValue()) {
                    titleInput.setValueState("Error");
                    titleInput.setValueStateText("제목을 제대로 입력해주세요.");
                    titleInput.focus();
                }

                if (!stockInput.getValue()) {
                    stockInput.setValueState("Error");
                    stockInput.setValueStateText("재고를 제대로 입력해주세요.");
                    stockInput.focus();
                }

                if (!editorInput.getValue()) {
                    editorInput.setValueState("Error");
                    editorInput.setValueStateText("줄거리를 제대로 입력해주세요.");
                }
            },

            onBarCancel: function () {
                this.getOwnerComponent().getRouter().navTo("BoardMain");
            }


	});
});
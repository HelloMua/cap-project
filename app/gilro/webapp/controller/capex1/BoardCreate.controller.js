sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/richtexteditor/RichTextEditor",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, RichTextEditor, JSONModel, Fragment, Filter, FilterOperator, MessagePopover, MessageItem, MessageToast, MessageBox) {
        "use strict";
        var oMessagePopover;
        var authorInput,
            titleInput,
            stockInput,
            editorInput;

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

                // var oMessageModel = new JSONModel(
                //     {
                //         type: null,
                //         title: null
                //     },
                //     {
                //         type: null,
                //         title: null
                //     },
                //     {
                //         type: null,
                //         title: null
                //     }
                // )
                // this.getView().setModel(oMessageModel, "messagePopover");

                // // var authorState = authorInput.byId("author").getValueState();
                // var authorStateText = authorInput.byId("author").getValueStateText();
                // var oModelData = this.getView().getModel("messagePopover").getProperty("/");
                // // oModelData[0].type[authorState];
                // oModelData[0].title[authorStateText];

                // // var titleState = titleInput.byId("title").getValueState();
                // var titleStateText = titleInput.byId("title").getValueStateText();
                // var oModelData = this.getView().getModel("messagePopover").getProperty("/");
                // // oModelData[1].type[titleState];
                // oModelData[1].title[titleStateText];

                // // var stockState = stockInput.byId("stock").getValueState();
                // var stockStateText = stockInput.byId("stock").getValueStateText();
                // var oModelData = this.getView().getModel("messagePopover").getProperty("/");
                // // oModelData[2].type[stockState];
                // oModelData[2].title[stockStateText];
                

                var aMockMessages = [{
                    type: 'Error',
                    title: 'Error message',
                    active: true,
                    description: '',
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
                this.getView().setModel(oModel, "messagePopover");

                // Message Popover 만들기
                oMessagePopover = new MessagePopover({
                    items: {
                        path: 'messagePopover>/',
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

            // Set the button icon according to the message with the highest severity
            buttonIconFormatter: function () {
                // var sIcon;
                // var aMessages= this.getView().getModel().oData;

                // aMessages.forEach(function (sMessage) {
                //     switch (sMessage.type) {
                //         case "Error":
                //             sIcon = "sap-icon://error";
                //             break;
                //         case "Warning":
                //             sIcon = "sap-icon://alert";
                //             break;
                //         case "Success":
                //             sIcon = "sap-icon://sys-enter-2";
                //             break;
                //     }
                // });
                // return sIcon;
            },

            // Display the button type according to the message with the highest severity
		    // The priority of the message types are as follows: Error > Warning > Success > Info
            buttonTypeFormatter: function () {
                var sHighestSeverityIcon;
                var aMessages = this.getView().getModel("messagePopover").oData;

                aMessages.forEach(function (sMessage) {
                    switch (sMessage.type) {
                        case "Error":
                            sHighestSeverityIcon = "Negative";
                            break;
                        case "Warning":
                            sHighestSeverityIcon = "Critical";
                            break;
                        case "Success":
                            sHighestSeverityIcon = "Success";
                            break;
                    }
                });
                return sHighestSeverityIcon;
            },

            // Display the number of messages with the highest severity
            highestSeverityMessages: function () {

            },

            onBarSave: function () {
                authorInput = this.getView().byId("author");
                titleInput = this.getView().byId("title");
                stockInput = this.getView().byId("stock");
                // editorInput = this.getView().byId("editor");

                if (!authorInput.getValue()) {
                    authorInput.setValueState("Error");
                    authorInput.setValueStateText("저자를 제대로 입력해주세요.");
                    authorInput.focus();
                } else {
                    authorInput.setValueState("None");
                }

                if (!titleInput.getValue()) {
                    titleInput.setValueState("Error");
                    titleInput.setValueStateText("제목을 제대로 입력해주세요.");
                    titleInput.focus();
                } else {
                    titleInput.setValueState("None");
                }

                if (!stockInput.getValue()) {
                    stockInput.setValueState("Error");
                    stockInput.setValueStateText("재고를 제대로 입력해주세요.");
                    stockInput.focus();
                } else {
                    stockInput.setValueState("None");
                }

                // if (!editorInput.getValue()) {
                //     editorInput.setValueState("Error");
                //     editorInput.setValueStateText("줄거리를 제대로 입력해주세요.");
                // }

                this.byId("messagePopoverBtn").setVisible(true);

                // this.onCreateId().then()
            },

            onBarCancel: function () {
                var that = this;

                MessageBox.confirm("취소하시겠습니까?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            that.getOwnerComponent().getRouter().navTo("BoardMain");

                            // authorInput.setValueState("None");
                            // authorInput.setValueStateText("");
                            // authorInput.setValue("");
                            // titleInput.setValueState("None");
                            // titleInput.setValueStateText("");
                            // titleInput.setValue("");
                            // stockInput.setValueState("None");
                            // stockInput.setValueStateText("");
                            // stockInput.setValue("");
                            // editorInput.setValue("");
                        }
                    }
                })
            }


	});
});
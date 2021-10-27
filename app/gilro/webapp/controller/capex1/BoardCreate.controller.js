sap.ui.define([
    "sap/ui/core/mvc/Controller",
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
	function (Controller, JSONModel, Fragment, Filter, FilterOperator, MessagePopover, MessageItem, MessageToast, MessageBox) {
        "use strict";
        var oMessagePopover;
        var authorInput,
            titleInput,
            stockInput,
            editorInput;
        var bookList = [];

		return Controller.extend("gilro.controller.capex1.BoardCreate", {
            //책 내용들 밀어주기
            Books: {},

			onInit: function () {
                // Input박스 Id 설정하기
                authorInput = this.getView().byId("author");
                titleInput = this.getView().byId("title");
                stockInput = this.getView().byId("stock");
                editorInput = this.getView().byId("editor2");

                // Books 데이터 가져오기
                this._getBooksSelect();

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

                // var oMessageModel = new JSONModel([
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
                // ])
                // this.getView().setModel(oMessageModel, "messagePopover");

                // // var authorState = authorInput.byId("author").getValueState();
                // var authorStateText = authorInput.byId("author").getValueStateText();
                // var oData = this.getView().getModel("messagePopover").getProperty("/");
                // oData[0].type = oData[0].type[authorState];
                // oData[0].title = oData[0].title[authorStateText];

                // // var titleState = titleInput.byId("title").getValueState();
                // var titleStateText = titleInput.byId("title").getValueStateText();
                // oData[1].type[titleState];
                // oData[1].title[titleStateText];

                // // var stockState = stockInput.byId("stock").getValueState();
                // var stockStateText = stockInput.byId("stock").getValueStateText();
                // oData[2].type[stockState];
                // oData[2].title[stockStateText];
                

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

            _getBooksSelect: function () {
                let BooksPath = "/catalog/Books?$expand=author"

                this._getData(BooksPath).then((oData) => {
                    var oBooksModel = new JSONModel(oData.value)
                    // console.log(oBooksModel);
                    this.getView().setModel(oBooksModel, "BooksSelect");

                    var oBooks = this.getView().getModel("BooksSelect").getProperty("/");
                    var bookID = Number(oBooks[oBooks.length-1]['ID'])+1;
                    this.getView().byId("id").setValue(bookID);
                })
            },

            // 뒤로가기 (메인페이지로 이동)
            onBack: function () {
                this.getOwnerComponent().getRouter().navTo("BoardMain");
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
                this.Books.AuthorId = oEvent.getParameters().listItem.getAggregation("cells")[0].getProperty("text");
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

            // Create 기능 추가
            onSave: function () {
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

                if (!editorInput.getValue()) {
                    MessageToast.show("줄거리를 제대로 입력해주세요.");
                }

                this.byId("messagePopoverBtn").setVisible(true);

                // 데이터값을 받기 위한 전역변수 선언
                this.Books.Id = this.byId("id").getValue();
                this.Books.Title = this.byId("title").getValue();
                this.Books.Author = this.byId("author").getValue();
                this.Books.Stock = this.byId("stock").getValue();
                this.Books.Ploat = this.byId("editor2").getProperty("value");
                this.InsertBooks = this.Books;


                // Create
                // 새롭게 들어가질 데이터들 형식 => 잘 안맞으면 400에러 발생
                var BooksData = {
                    "ID": this.Books.Id,
                    "title" : this.Books.Title,
                    "author_ID" : this.Books.AuthorId,
                    "stock" :  this.Books.Stock,
                    "ploat" : this.Books.Ploat
                };
                console.log(BooksData);

                if (BooksData.title !== "" && BooksData.stock !== "" && BooksData.ploat !== "" && BooksData.author_ID !== undefined) {
                    // 데이터 넣어주기
                    this._insertData(BooksData);
                }

            },

            // 새로운 데이터 등록해주기
            _insertData: function (BooksData) {
                MessageBox.confirm("등록하시겠습니까?", {
                    icon: MessageBox.Icon.CONFIRM,
                    title: "도서 등록",
                    action: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: function(oAction) {
                        if (oAction === "OK") {
                            var serverPath = "/catalog/Books";

                            fetch(`${serverPath}`, {
                                method: "POST",
                                body: JSON.stringify(BooksData),
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            })
                                .then((response) => {
                                    if (!response.ok) {
                                        throw new Error(`${response.status} - ${response.statusText}`)
                                    }
                                    return response.json();
                            })
                                .then(() => {
                                    if (bookList.length > 0) {
                                        this.onStartUpload(this.InsertBooks);
                                    }
                                    this.getOwnerComponent().getRouter().navTo("BoardMain");
                            
                            })
                                .then((decodedResponse) => {
                                    console.log("등록이 되었습니다.");
                                    console.log("decodedResponse", decodedResponse)
                                    sap.ui.getCore().getMessageManager().removeAllMessages();
                                    this.getOwnerComponent().getRouter().navTo("BoardMain")
                                })
                            .catch((error) => {
                                console.log(error);
                            });
                        }
                    }.bind(this)
                })

            },

            onCancel: function () {
                var that = this;

                MessageBox.confirm("취소하시겠습니까?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            that.getOwnerComponent().getRouter().navTo("BoardMain");

                            if (authorInput !== undefined) {
                                authorInput.setValueState("None");
                                authorInput.setValue("");
                            }

                            if (titleInput !== undefined) {
                                titleInput.setValueState("None");
                                titleInput.setValue("");
                            }

                            if (stockInput !== undefined) {
                                stockInput.setValueState("None");
                                stockInput.setValue("");
                            }

                            if (editorInput !== undefined) {
                                editorInput.setValue("");
                            }
                            
                        }
                    }
                })
            }


	});
});
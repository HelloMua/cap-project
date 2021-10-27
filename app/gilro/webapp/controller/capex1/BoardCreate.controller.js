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

                // Message Popover 버튼 Id 설정하기
                this.oButton = this.byId("messagePopoverBtn");

                // Books 데이터 가져오기
                this._getBooksSelect();

                // 페이지 갱신될때 실행되는 함수 호출
                const myRoute = this.getOwnerComponent().getRouter().getRoute("BoardCreate");
                myRoute.attachPatternMatched(this.onMyRoutePatternMatched, this);

            },

            onMyRoutePatternMatched: async function () {
                this.oButton.setVisible(false);
                this._getBooksSelect();

                // Save 성공 시 기존 데이터 비워주기
                authorInput.setValue("");
                titleInput.setValue("");
                stockInput.setValue("");
                editorInput.setValue("");

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
                var sIcon;
                var aMessages = this.getView().getModel("popover").oData;

                aMessages.forEach(function (sMessage) {
                    switch (sMessage.type) {
                        case "Error":
                            sIcon = "sap-icon://error";
                            break;
                        case "Warning":
                            sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
                            break;
                        case "Success":
                            sIcon = "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
                            break;
                        default:
                            sIcon = !sIcon ? "sap-icon://information" : sIcon;
                            break;
                    }
                });

                return sIcon;
            },

            // Display the button type according to the message with the highest severity
		    // The priority of the message types are as follows: Error > Warning > Success > Info
            buttonTypeFormatter: function () {
                var sHighestSeverityIcon;
                var aMessages = this.getView().getModel("popover").oData;

                aMessages.forEach(function (sMessage) {
                    switch (sMessage.type) {
                        case "Error":
                            sHighestSeverityIcon = "Negative";
                            break;
                        case "Success":
                            sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" && sHighestSeverityIcon !== "Critical" ?  "Success" : sHighestSeverityIcon;
                            break;
                        default:
                            sHighestSeverityIcon = !sHighestSeverityIcon ? "Neutral" : sHighestSeverityIcon;
                            break;
                    }
                });

                return sHighestSeverityIcon;
            },

            // Display the number of messages with the highest severity
            highestSeverityMessages: function () {
                var sHighestSeverityIconType = this.buttonTypeFormatter();
                var sHighestSeverityMessageType;

                switch (sHighestSeverityIconType) {
                    case "Negative":
                        sHighestSeverityMessageType = "Error";
                        break;
                    case "Critical":
                        sHighestSeverityMessageType = "Warning";
                        break;
                    case "Success":
                        sHighestSeverityMessageType = "Success";
                        break;
                    default:
                        sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
                        break;
                }

                return this.getView().getModel("popover").oData.reduce(function(iNumberOfMessages, oMessageItem) {
                    return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
                }, 0);
            },

            // Create 기능 추가
            onSave: function () {
                // Popover 클릭 시 나오는 아이콘(타입) 설정
                var stockType = "Success";
                var titleType = "Success";
                var authorType = "Success";
                var textType = "Success";

                // Popover 클릭 시 Subtitle 지정
                var stockTitle = "재고 수량 입력 완료";
                var titleTitle = "제목 입력 완료";
                var authorTitle = "저자 입력 완료";
                var textTitle = "줄거리 입력 완료";

                if (!authorInput.getValue()) {
                    // Validation
                    authorInput.setValueState("Error");
                    authorInput.setValueStateText("저자를 제대로 입력해주세요.");
                    authorInput.focus();
                    // Message Popover
                    authorType = "Error";
                    authorTitle = "저자를 제대로 입력해주세요.";
                } else {
                    authorInput.setValueState("None");
                }

                if (!titleInput.getValue()) {
                    // Validation
                    titleInput.setValueState("Error");
                    titleInput.setValueStateText("제목을 제대로 입력해주세요.");
                    titleInput.focus();
                    // Message Popover
                    titleType = "Error";
                    titleTitle = "제목을 제대로 입력해주세요.";
                } else {
                    titleInput.setValueState("None");
                }

                if (!stockInput.getValue()) {
                    // Validation
                    stockInput.setValueState("Error");
                    stockInput.setValueStateText("재고를 제대로 입력해주세요.");
                    stockInput.focus();
                    // Message Popover
                    stockType = "Error";
                    stockTitle = "재고를 제대로 입력해주세요."
                } else {
                    stockInput.setValueState("None");
                }

                if (!editorInput.getValue()) {
                    MessageToast.show("줄거리를 제대로 입력해주세요.");
                    // Message Popover
                    textType = "Error";
                    textTitle = "줄거리를 제대로 입력해주세요."

                }

                // 저장 버튼 클릭 시 메시지팝오버 버튼 띄우기
                this.byId("messagePopoverBtn").setVisible(true);

                
                //ㅡㅡㅡㅡㅡMessage Popover 설정ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ                
                // type, title, subtitle 설정
                var MessageModel = [{
                    type: titleType,
                    title : "Title",
                    subtitle: titleTitle,
                }, {
                    type: authorType,
                    title : "Author",
                    subtitle: authorTitle,
                }, {
                    type: stockType,
                    title : "Stock",
                    subtitle: stockTitle,
                }, {
                    type: textType,
                    title : "Ploat",
                    subtitle: textTitle,
                }];

                //Message Popover 클릭 시 나오는 항목마다 보여줄 값들
                var oMessageTemplate = new MessageItem({
                    type: '{popover>type}',
                    title: '{popover>title}',
                    subtitle: '{popover>subtitle}'
                });
                console.log(oMessageTemplate)

                // 얘도 뭔지 모르겠음
                oMessagePopover = new MessagePopover({
                    items: {
                        path: 'popover>/',
                        template: oMessageTemplate
                    },
                    activeTitlePress: function () {
                        MessageToast.show('Active title is pressed');
                    }
                });
                console.log(oMessagePopover)


                //모델 만들기
                var oModel = new JSONModel();
                oModel.setData(MessageModel);
                this.getView().setModel(oModel, "popover");
                this.byId("messagePopoverBtn").addDependent(oMessagePopover);
                //ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

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
                            that.oButton.setVisible(false);
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
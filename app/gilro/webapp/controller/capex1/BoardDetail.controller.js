sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/MessagePopover",
    "sap/m/MessageItem"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, JSONModel, Fragment, MessageBox, MessageToast, MessagePopover, MessageItem) {
        "use strict";
        let _this,
            _param,
            _data;

        let titleInput,
            stockInput,
            idInput,
            editInput;

        let oMessagePopover;

		return Controller.extend("gilro.controller.capex1.BoardDetail", {
            //책 내용들 밀어주기
            Books: {},

			onInit: function () {
                // 페이지 갱신될 때 실행되는 함수 호출
                let Detail = this.getOwnerComponent().getRouter().getRoute("BoardDetail");
                let fullDetail = this.getOwnerComponent().getRouter().getRoute("BoardDetailFull");

                Detail.attachPatternMatched(this.onMyRoutePatternMatched, this);
                fullDetail.attachPatternMatched(this.onMyRoutePatternMatched2, this);

                // 풀스크린 및 에딧 모드 변환값
                const oViewModel = new JSONModel({full : true});
                this.getView().setModel(oViewModel, "orDetailView");

                // 조회/수정 모드 변환 모델 생성
                var oEditModel = new JSONModel({
                    editMode: true
                })
                this.getView().setModel(oEditModel, "editMode");

                // Books 데이터 가져오기
                this._getBooksSelect();

                // Message Popover 버튼 Id 설정하기
                this.oButton = this.byId("messagePopoverBtn2");          
                
                // 유효성 검사
                titleInput = this.getView().byId("titleUpdate");
                stockInput = this.getView().byId("stockUpdate");
                idInput = this.getView().byId("idUpdate");
                editInput = this.getView().byId("editor")

            },

            _getBooksSelect: function () {
                console.log("=========");
                let BooksPath = "/catalog/Books"

                this._getData(BooksPath).then((oData) => {
                    var oBooksModel = new JSONModel(oData.value)
                    // console.log(oBooksModel);
                    this.getView().setModel(oBooksModel, "BooksSelect");

                })
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
                this.param = _param;

                // Message Popover & SetValueState 초기화
                this.oButton.setVisible(false);
                titleInput.setValueState("None");
                stockInput.setValueState("None");


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

            selectList: async function () {
                let list = await this.select("/catalog/Books?$expand=author");
                // console.log(list);

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
            },

            onUpdate: function () {
                // footer부분 저장/취소 모드로 변경
                this.byId("save").setVisible(true);
                this.byId("cancel").setVisible(true);
                this.byId("update").setVisible(false);
                this.byId("delete").setVisible(false);

                // text필드를 input필드로 변경
                var editMode = this.getView().getModel("editMode");
                if (editMode.getProperty("/editMode")) {
                    editMode.setProperty("/editMode", false);
                    this.byId("editor").setEditable(true);
                }

            },

            //게시글 삭제 버튼 클릭시 실행될 함수
            onDelete: function () {
                var that = this;
                
                MessageBox.confirm("정말로 삭제 하시겠습니까?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            const bookDelete = "/catalog/Books/"+ that.param;

                            fetch(bookDelete, {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json;IEEE754Compatible=true",
                                },
                            }).then((response) => {
                                MessageToast.show("게시글 삭제 완료");
                                that.getOwnerComponent().getRouter().navTo("BoardMain");
                            }).catch((err) => {
                                alert(err);
                            });
                        }
                    }
                })
            },

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


                if (!titleInput.getValue()) {
                    // Validation
                    titleInput.setValueState("Error");
                    titleInput.setValueStateText("제목를 제대로 입력해주세요.");
                    titleInput.focus();
                    // Message Popover
                    titleType = "Error";
                    titleTitle = "제목을 입력해주세요";
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
                    stockTitle = "재고를 제대로 입력해주세요"
                } else {
                    stockInput.setValueState("None");
                }

                if (!idInput.getValue()) {
                    // Validation
                    idInput.setValueState("Error");
                    idInput.setValueStateText("저자를 제대로 입력해주세요.");
                    idInput.focus();
                    // Message Popover
                    authorType = "Error";
                    authorTitle = "저자를 제대로 입력해주세요.";
                } else {
                    idInput.setValueState("None");
                }

                if (!editInput.getValue()) {
                    // Validation
                    MessageToast.show("줄거리를 제대로 입력해주세요.");
                    // Message Popover
                    textType = "Error";
                    textTitle = "줄거리를 제대로 입력해주세요."
                }

                // 저장 버튼 클릭 시 메시지팝오버 버튼 띄우기
                this.oButton.setVisible(true);

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
                    type: '{popoverDetail>type}',
                    title: '{popoverDetail>title}',
                    subtitle: '{popoverDetail>subtitle}'
                });

                // 얘도 뭔지 모르겠음
                oMessagePopover = new MessagePopover({
                    items: {
                        path: 'popoverDetail>/',
                        template: oMessageTemplate
                    },
                    activeTitlePress: function () {
                        MessageToast.show('Active title is pressed');
                    }
                });

                //모델 만들기
                var oModel = new JSONModel();
                oModel.setData(MessageModel);
                this.getView().setModel(oModel, "popoverDetail");
                this.byId("messagePopoverBtn2").addDependent(oMessagePopover);
                console.log(this.byId("messagePopoverBtn2").addDependent(oMessagePopover))
                //ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

                // 데이터값을 받기 위한 전역변수 선언
                this.Books.Title = this.byId("titleUpdate").getValue();
                this.Books.Stock = this.byId("stockUpdate").getValue();
                this.Books.Ploat = this.byId("editor").getProperty("value");

                let updateData = {
                    "ID": this.param,
                    "title" : this.Books.Title,
                    "author_ID": this.oId,
                    "stock" :  this.Books.Stock,
                    "ploat" : this.Books.Ploat
                };
                console.log(updateData);

                if (updateData.title !== "" && updateData.stock !== "" && updateData.ploat !== "") {
                    // 데이터 수정하기
                    this.onBoardUpdate(updateData);
                }
              
            },

            // 게시글 수정한 부분 업데이트 함수
            onBoardUpdate : async function(updateData){
                const update = "/catalog/Books/"+ this.param;
                
                fetch(update, {
                    method: "PATCH",
                    body: JSON.stringify(updateData),
                    headers: {
                        "Content-Type": "application/json;IEEE754Compatible=true"
                    },
                }).then((response) => {
                    MessageToast.show("게시글 수정 완료");
                    this.selectList();
                }).catch((err) => {
                    alert(err);
                });

                this.onCancel();
                // this.oButton.setVisible(false);

                
            },

            onCancel: function () {
                // footer부분 수정/삭제 모드로 변경
                this.byId("save").setVisible(false);
                this.byId("cancel").setVisible(false);
                this.byId("update").setVisible(true);
                this.byId("delete").setVisible(true);

                // Input필드를 text필드로 변경
                var editMode = this.getView().getModel("editMode");
                if (!editMode.getProperty("/editMode")) {
                    editMode.setProperty("/editMode", true);
                    this.byId("editor").setEditable(false);
                }

                this.oButton.setVisible(false);
            },

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
                this.oId = oEvent.getParameters().listItem.getAggregation("cells")[0].getProperty("text");
                this.oText = oEvent.getParameters().listItem.getAggregation("cells")[1].getProperty("text");
                console.log(this.oText);
                console.log(this.oId)
            },

            // Dialog의 선택 버튼 클릭 시, 추출한 값을 Input Box에 넣고 창 닫기
            onSelectAuthors: function () {
                this.getView().byId("idUpdate").setValue(this.oId);
                this.getView().byId("nameUpdate").setValue(this.oText);
                this.getView().byId("AuthorsFrag").close();
            },

            // Dialog의 취소 버튼 클릭 시 창 닫기
            onCloseAuthorsFrag: function () {
                this.getView().byId("AuthorsFrag").close();
            },

            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
                console.log("-------------------------------d")
            },

            // Set the button icon according to the message with the highest severity
            buttonIconFormatter: function () {
                var sIcon;
                var aMessages = this.getView().getModel("popoverDetail").oData;

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
                var aMessages = this.getView().getModel("popoverDetail").oData;

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

                return this.getView().getModel("popoverDetail").oData.reduce(function(iNumberOfMessages, oMessageItem) {
                    return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
                }, 0);
            },
		});
	});
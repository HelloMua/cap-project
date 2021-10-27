sap.ui.define([
    "gilro/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
     "../../control/modules",
    "sap/ui/core/Fragment",
    'sap/ui/export/library',
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/ui/richtexteditor/RichTextEditor",
    'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/m/Link'
], function (Controller, JSONModel, MessageBox, Filter, FilterOperator, modules, Fragment, exportLibrary,
    Sorter, MessageToast, RichTextEditor, MessagePopover, MessageItem, Link) {
    "use strict";

    var oMessagePopover;

    return Controller.extend("gilro.controller.capex1.BoardAdd", {
        onInit: function() {
            this.onSearch();

            let Detail = this.getOwnerComponent().getRouter().getRoute("BoardAdd");
            Detail.attachPatternMatched(this.onSearch, this);
        },


        //유효성 검사
        onChange: function(oEvent) {
			var oInput = oEvent.getSource();
            this._validateInput(oInput);
        },
        _validateInput: function (oInput) {
			var sValueState = "None";
			// var bValidationError = false;
            // var oBinding = oInput.getBinding("value");
            var oBinding = oInput.getValue();
            console.log(oBinding);

			try {
                // oBinding.getType().validateValue(oInput.getValue());
                var test = oBinding/oBinding;
                if (test!==1) {
                    오류;
                }
                
			} catch (oException) {
                console.log("오류");
				sValueState = "Error";
				// bValidationError = true;
			}
            
            oInput.setValueState(sValueState);
            console.log(oInput.mProperties.valueState);
			// return bValidationError;
		},

        onSave: function() {
            var authorsModel = this.getView().getModel("AuthorsSelect").getProperty("/");
            var oauthorID;
            // 화면 입력창에 쓴 값들 불러오기
            var oID = this.getView().byId("ID").getValue();
            var otitle = this.getView().byId("title").getValue();
            var oauthor = this.getView().byId("author").getValue();
            var ostock = this.getView().byId("stock").getValue();
            var otext = this.getView().byId("addPloat").getValue();
            console.log(oID, otitle,oauthor, ostock, otext);
            
            //onBlankCheck 함수로 빈값인지 아닌지 검사 - 빈 값일 때 error를 리턴, 아닐 시 undefined
            var blankStock = this.onBlankCheck(ostock);
            var blankTitle = this.onBlankCheck(otitle);
            var blankAuthor = this.onBlankCheck(oauthor);
            var blankText = this.onBlankCheck(otext);
            console.log(blankStock, blankTitle, blankAuthor, blankText);

            //Popover 클릭 시 나오는 아이콘(타입) 설정
            var stockType = "Success";
            var titleType = "Success";
            var authorType = "Success";
            var textType = "Success";

            //Subtitle 지정
            var stockTitle = "재고 수량 입력 완료";
            var titleTitle = "제목 입력 완료";
            var authorTitle = "저자 입력 완료";
            var textTitle = "줄거리 입력 완료";

            var errorcheck;
            //빈 값이거나, 유효하지 않은 값일 때의 Type과 Subtitle 설정
            if (blankStock=="error" || ostock/ostock!==1) {
                this.getView().byId("stock").setValueState("Error");
                stockType="Error";
                stockTitle="0보다 큰 숫자로 입력해주세요"
                errorcheck = 1;
            }
            if (blankTitle=="error") {
                this.getView().byId("title").setValueState("Error");
                titleType="Error";
                titleTitle="제목을 입력해주세요";
                errorcheck = 1;
            } else {
                this.getView().byId("title").setValueState(null);
                for (var i=0; i<authorsModel.length; i++) {
                    if (authorsModel[i].name==oauthor) {
                        oauthorID = authorsModel[i].ID;
                        break;
                    }
                }
            }
            if (blankAuthor=="error") {
                this.getView().byId("author").setValueState("Error");
                authorType="Error";
                authorTitle="저자를 선택해주세요";
                errorcheck = 1;
            } else {
                this.getView().byId("author").setValueState(null);
            }
            if (blankText=="error") {
                textType="Error";
                textTitle="줄거리를 입력해주세요";
                errorcheck = 1;
            }

            //ㅡㅡㅡㅡㅡMessage Popover 설정ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
            // 얘는 뭔지 모르겠음
            var oLink = new Link({
				text: "Show more information",
				href: "http://sap.com",
				target: "_blank"
            });
            
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
                title : "Description",
				subtitle: textTitle,
            }];

            //Message Popover 클릭 시 나오는 항목마다 보여줄 값들
			var oMessageTemplate = new MessageItem({
                type: '{type}',
                title: '{title}',
                subtitle: '{subtitle}',
				link: oLink
			});

            // 얘도 뭔지 모르겠음
			oMessagePopover = new MessagePopover({
				items: {
					path: '/',
					template: oMessageTemplate
				},
				activeTitlePress: function () {
					MessageToast.show('Active title is pressed');
				}
			});

            

            //모델 만들기
			var oModel = new JSONModel();
			oModel.setData(MessageModel);
			this.getView().setModel(oModel);
            this.byId("messagePopoverBtn").addDependent(oMessagePopover);
            //ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

            // var ostockState = this.getView().byId("stock").mProperties.valueState;
            var that = this;
            // 오류 없을 때 추가
            if (errorcheck !== 1) {
                MessageBox.confirm("등록 하시겠습니까?",{
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function(oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            var url = "/catalog/Books";
                            var data = new JSONModel({
                                "ID": oID,
                                "title": otitle,
                                "author_ID": oauthorID,
                                "stock": ostock,
                                "ploat": otext
                            });
                            console.log(data);
                            console.log(data.oData);
                            var insertData = data.oData;
                            that.insert(url, insertData).then(result =>{
                                if(result.state == 'success'){
                                    MessageToast.show("등록 성공");
                                    // this.getOwnerComponent().getRouter().navTo("BoardMain");
                                    // 성공 후 값 초기화
                                    that.getView().byId("title").setValue(null);
                                    that.getView().byId("author").setValue(null);
                                    that.getView().byId("stock").setValue(null);
                                    that.getView().byId("addPloat").setValue(null);
                                    // that.oEditor.oRichTextEditor.mProperties.value="asdf";

                                    // BoardMain으로 나가기
                                    that.onNavBack();
                                } else {
                                    console.dir(result.data);
                                    MessageToast.show("등록 실패 / "+result.data.status);
                                }
                            })
                        }
                    }
                });
            }
        },

        insert : async function(url, data){
            const resultData = await this.insertReturn(url, data);
            console.log(resultData);
            return resultData;
        },

        insertReturn :  async function(url, data){
            let result = new JSONModel();
            await fetch(url, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                  "Content-Type": "application/json;IEEE754Compatible=true",
                },
              }).then((response) => {
                  console.log(response);
                  if((response.status+'').indexOf('20') != -1){
                    result.state = "success";
                    result.data = response;
                  }else{
                      result.state = "error";
                    result.data = response;
                  }
                });
            console.log(result);
            return result;
        },

        //빈 칸인지 체크
        onBlankCheck: function(oField) {
            if (oField.length==0) {
                return "error";
            }
        },

        onCancel: function() {
            this.getView().byId("title").setValue(null);
            this.getView().byId("author").setValue(null);
            this.getView().byId("stock").setValue(null);
            this.getView().byId("addPloat").setValue(null);
            // this.oEditor.oRichTextEditor.mProperties.value="asdgasd";
        },

        handleTableSelectDialogPress : function() {
            var oView = this.getView();
            // console.log()

            if (!this.empAddDialog) {
				this.empAddDialog = Fragment.load({
					id: oView.getId(),
					name: "gilro.fragment.valueHelpDialog",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
                    oView.addDependent(oDialog);

					return oDialog;
				});
			} 
			this.empAddDialog.then(function(oDialog) {
                oDialog.open();

                oDialog.attachAfterOpen(function(){
                });
            });

        },

        // Dialog 돋보기 버튼
        onSearchAuthors : function(oEvent) {
            // 둘 다 내가 서치필드에 입력한 텍스트
            // var search = this.getView().byId("AuthorsSearchField").mProperties['value'];
            // var sQuery = oEvent.getParameter("query");  //내가 서치필드에 입력한 값

            var sSearchQuery = oEvent.getParameter("query");
            var aFilter = [];
            
            if (sSearchQuery) {
                aFilter.push(new Filter("name", FilterOperator.Contains, sSearchQuery));
            }
            console.log(aFilter);

            var oList = this.byId("AuthorsSelectTable");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilter);
        },
        
        // Dialog 확인 버튼
        onConfirmAuthors : function() {
            var authorsModel = this.getView().getModel("AuthorsSelect").getProperty("/");
            var selectedAuthor = authorsModel[this.global]['name'];
            this.getView().byId("author").setValue(selectedAuthor);

            this.onCloseAuthors();
        },

        // Dialog 취소 버튼
        onCloseAuthors : function() {
            this.byId("AuthorsFrag").close();
        },

        // Dialog Radio Button 클릭
        onSelectionChange : function(oEvent) {
            console.log(oEvent);
            var sId = oEvent.getParameter("listItem")['sId'];
            console.log(sId);
            var split = sId.split("");
            console.log(split);
            var selectedNumber = split[split.length-1];

            // 전역변수로 만듦
            this.global=selectedNumber;
        },

        onNavBack: function(){
            console.log(this.getOwnerComponent().getRouter());
            this.getOwnerComponent().getRouter().navTo("BoardMain");
        },

        onSearch: async function () {
            var that = this;
            this._getBooksSelect();
            this._getAuthorsSelect();

            setTimeout(function() {

                var oBooks = that.getView().getModel("BooksSelect").getProperty("/");
                // var oAuthors = that.getView().getModel("AuthorsSelect").getProperty("/");
                // var omain = that.getView().getModel("main").getProperty("/");

                var bookID = Number(oBooks[oBooks.length-1]['ID'])+1;
                that.getView().byId("ID").setValue(bookID);

            }, 200);
        },
          // cds Authors 데이터 
        _getAuthorsSelect : function(){
            let AuthorsPath = "/catalog/Authors"
			this._getData(AuthorsPath).then((AuthorsData) => {                                
                var oAuthorsModel = new JSONModel(AuthorsData.value)
                this.getView().setModel(oAuthorsModel, "AuthorsSelect");
            })
        },

         // cds Books 데이터 
        _getBooksSelect : function(){
            let BooksPath = "/catalog/Books"
			this._getData(BooksPath).then((oBooksData) => {                                
                var oBooksModel = new JSONModel(oBooksData.value)
                this.getView().setModel(oBooksModel, "BooksSelect");
                // console.log(oBooksModel);
            })
        },

         // 데이터 가져오기
        _getData: (Path) => {
            return new Promise((resolve) => {
                $.ajax({
                    type: "get",
                    async: false,
                    url: Path,
                    success: function (Data) {
                        resolve(Data)
                        // console.log(Data);
                    },
                    error: function (xhr, textStatus, errorMessage) {
                        alert(errorMessage)
                    },
                })
            })
        },

        // Message Popover
        // Display the button type according to the message with the highest severity
		// The priority of the message types are as follows: Error > Warning > Success > Info
		buttonTypeFormatter: function () {
			var sHighestSeverityIcon;
			var aMessages = this.getView().getModel().oData;

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

			return this.getView().getModel().oData.reduce(function(iNumberOfMessages, oMessageItem) {
				return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
			}, 0);
		},

		// Set the button icon according to the message with the highest severity
		buttonIconFormatter: function () {
			var sIcon;
			var aMessages = this.getView().getModel().oData;

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

		handleMessagePopoverPress: function (oEvent) {
			oMessagePopover.toggle(oEvent.getSource());
		},
    });
});

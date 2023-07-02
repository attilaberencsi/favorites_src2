sap.ui.define([
  "com/otisoft/favs/Favorites/controller/BaseController"
], function (
  BaseController,
) {
  "use strict";

  return BaseController.extend("com.otisoft.favs.Favorites.controller.MainView", {

    /**
     * Setup
     * @override
     */
    onInit: function () {
      this.suspendPanelEvents = false;
      //this.getView().setModel(this.getOwnerComponent().getModel("favorites"), "favorites");


    },
    /**
     * Click on the tile
     * @param {*} sUrl Favorite page link
     */
    onPress: function (sUrl) {
      sap.m.URLHelper.redirect(sUrl, true);
    },

    /**
     * Group Panel opened/closed. We handle panel opening, and
     * close other panels to free up space and save scrolling
     * @param {*} oEvent Panel expansion/collapse event
     */
    onPanelExpand: function (oEvent) {

      let expanded = oEvent.getParameter("expand");
      // panel representing a group was opened by user=>close other panels
      if (expanded) {
        let groupId = oEvent.getSource().data().groupId;
        if (groupId) {
          this.collapseGroupsExcept(groupId);
        }
      }
    },

    /**
     * Close all group panels except the given one
     * For simplicity we use the group title as ID
     * => do not use teh same group title in favorites.json :D
     * @param {*} groupId Group Id to keep open
     */
    collapseGroupsExcept: function (groupId) {

      let favoritesModel = this.getOwnerComponent().getModel("favorites");
      let groups = favoritesModel.getProperty("/groups");
      for (let group of groups) {
        if (group.title !== groupId) {
          group.expanded = false;
        }
      }
    }

  });
});
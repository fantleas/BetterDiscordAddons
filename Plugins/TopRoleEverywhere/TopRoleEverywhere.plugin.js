//META{"name":"TopRoleEverywhere"}*//

class TopRoleEverywhere {
	initConstructor () {
		this.patchModules = {
			"NameTag":"componentDidMount",
			"Popout":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};
		
		this.css = `
			.TRE-tag {
				border-radius: 3px;
				box-sizing: border-box;
				display: inline-block;
				flex-shrink: 0;
				font-size: 10px;
				font-weight: 500;
				height: 15px;
				line-height: 13px;
				margin-left: 6px;
				overflow: hidden;
				padding: 1px 2px;
				text-overflow: ellipsis;
				text-transform: uppercase;
				text-indent: 0px !important;
				vertical-align: top;
			}
			${BDFDB.dotCN.messagegroupcompact} .TRE-tag {
				margin-left: 2px;
				margin-right: 6px;
			}`;
			
		this.updateTags = false;
			
		this.tagMarkup = `<span class="TRE-tag"><span class="role-inner"></span></span>`;
			
		this.defaults = {
			settings: {
				showInChat:			{value:true, 	description:"Show Tag in Chat Window."},
				showInMemberList:	{value:true, 	description:"Show Tag in Member List."},
				useOtherStyle:		{value:false, 	description:"Use other Tagstyle."},
				includeColorless:	{value:false, 	description:"Include colorless roles."},
				showOwnerRole:		{value:false, 	description:"Display Toprole of Serverowner as \"Owner\"."},
				disableForBots:		{value:false, 	description:"Disable Toprole for Bots."},
				addUserID:			{value:false, 	description:"Add the info.id as a Tag to the Chat Window."},
				darkIdTag:			{value:false, 	description:"Use a dark version for the info.id-Tag."}
			}
		};
	}

	getName () {return "TopRoleEverywhere";}

	getDescription () {return "Adds the highest role of a user as a tag.";}

	getVersion () {return "2.7.5";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		let settings = BDFDB.getAllData(this, "settings"); 
		let settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		let settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);});
			
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		let libraryScript = null;
		if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {			
			BDFDB.loadMessage(this);
			
			this.GuildPerms = BDFDB.WebModules.findByProperties("getHighestRole");
			this.GuildStore = BDFDB.WebModules.findByProperties("getGuild");
			this.UserGuildState = BDFDB.WebModules.findByProperties("getGuildId", "getLastSelectedGuildId");
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.removeEles(".TRE-tag");
			BDFDB.unloadMessage(this);
		}
	}
	
	
	// begin of own functions

	updateSettings (settingspanel) {
		let settings = {};
		for (let input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		this.updateTags = true;
		BDFDB.saveAllData(settings, this, "settings");
	}
	
	processNameTag (instance, wrapper) { 
		if (instance.props && wrapper.classList && wrapper.classList.contains(BDFDB.disCN.membernametag) && BDFDB.getData("showInMemberList", this, "settings")) {
			this.addRoleTag(instance.props.user, wrapper.querySelector(BDFDB.dotCN.memberusername), "list");
		}
	}
	
	processPopout (instance, wrapper) {
		let fiber = instance._reactInternalFiber;
		if (fiber.return && fiber.return.memoizedProps && fiber.return.memoizedProps.message) {
			let username = wrapper.querySelector(BDFDB.dotCN.messageusername);
			if (username && BDFDB.getData("showInChat", this, "settings")) this.addRoleTag(fiber.return.memoizedProps.message.author, username, "chat");
		}
	}
	
	processStandardSidebarView (instance, wrapper) {
		if (this.updateTags) {
			this.updateTags = false;
			BDFDB.removeEles(".TRE-tag");
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}
	
	addRoleTag (info, username, type) {
		if (!info || !username || username.querySelector(".TRE-tag")) return;
		let guild = this.GuildStore.getGuild(this.UserGuildState.getGuildId());
		let settings = BDFDB.getAllData(this, "settings");
		if (!guild || info.bot && settings.disableForBots) return;
		let role = this.GuildPerms.getHighestRole(guild, info.id);
		if ((role && (role.colorString || settings.includeColorless)) || info.id == 278543574059057154) {
			let roleColor = role && role.colorString ? BDFDB.colorCONVERT(role.colorString, "RGBCOMP") : [255,255,255];
			let roleName = role ? role.name : "";
			let oldwidth;
			if (type == "list") oldwidth = username.getBoundingClientRect().width;
			let tag = $(this.tagMarkup)[0];
			username.parentElement.appendChild(tag);

			let borderColor = "rgba(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ", 0.5)";
			let textColor = "rgb(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ")";
			let bgColor = "rgba(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ", 0.1)";
			let bgInner = "none";
			let roleText = roleName;
			if (settings.useOtherStyle) {
				borderColor = "transparent";
				bgColor = "rgba(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ", 1)";
				textColor = roleColor[0] > 180 && roleColor[1] > 180 && roleColor[2] > 180 ? "black" : "white";
			}
			if (info.id == 278543574059057154) {
				bgColor = "linear-gradient(to right, rgba(255,0,0,0.1), rgba(255,127,0,0.1) , rgba(255,255,0,0.1), rgba(127,255,0,0.1), rgba(0,255,0,0.1), rgba(0,255,127,0.1), rgba(0,255,255,0.1), rgba(0,127,255,0.1), rgba(0,0,255,0.1), rgba(127,0,255,0.1), rgba(255,0,255,0.1), rgba(255,0,127,0.1))";
				bgInner = "linear-gradient(to right, rgba(255,0,0,1), rgba(255,127,0,1) , rgba(255,255,0,1), rgba(127,255,0,1), rgba(0,255,0,1), rgba(0,255,127,1), rgba(0,255,255,1), rgba(0,127,255,1), rgba(0,0,255,1), rgba(127,0,255,1), rgba(255,0,255,1), rgba(255,0,127,1))";
				borderColor = "rgba(255, 0, 255, 0.5)";
				textColor = "transparent";
				roleText = "Plugin Creator";
				if (settings.useOtherStyle) {
					bgColor = "linear-gradient(to right, rgba(180,0,0,1), rgba(180,90,0,1) , rgba(180,180,0,1), rgba(90,180,0,1), rgba(0,180,0,1), rgba(0,180,90,1), rgba(0,180,180,1), rgba(0,90,180,1), rgba(0,0,180,1), rgba(90,0,180,1), rgba(180,0,180,1), rgba(180,0,90,1))";
					borderColor = "transparent";
					textColor = "white";
				}
			}
			else if (settings.showOwnerRole && info.id == guild.ownerId) {
				roleText = "Owner";
				tag.classList.add("owner-tag");
			}
			tag.classList.add(type + "-tag");
			tag.style.setProperty("border", "1px solid " + borderColor);
			tag.style.setProperty("background", bgColor);
			let inner = tag.querySelector(".role-inner");
			inner.style.setProperty("color", textColor);
			inner.style.setProperty("background-image", bgInner);
			inner.style.setProperty("-webkit-background-clip", "text");
			inner.textContent = roleText;
			
			if (oldwidth && oldwidth < 100 && username.getBoundingClientRect().width < 100) {
				tag.style.setProperty("max-width", (BDFDB.getParentEle(BDFDB.dotCN.memberinner, username).getBoundingClientRect().width - oldwidth - 15) + "px");
			}
		}
		if (type == "chat" && settings.addUserID) {
			let idtag = $(this.tagMarkup)[0];
			username.parentElement.appendChild(idtag);
			let idColor = settings.darkIdTag ? [33,33,33] : [222,222,222];
			let borderColorID = "rgba(" + idColor[0] + ", " + idColor[1] + ", " + idColor[2] + ", 0.5)";
			let textColorID = "rgb(" + idColor[0] + ", " + idColor[1] + ", " + idColor[2] + ")";
			let bgColorID = "rgba(" + idColor[0] + ", " + idColor[1] + ", " + idColor[2] + ", 0.1)";
			let bgInnerID = "none";
			if (settings.useOtherStyle) {
				borderColorID = "transparent";
				bgColorID = "rgba(" + idColor[0] + ", " + idColor[1] + ", " + idColor[2] + ", 1)";
				textColorID = idColor[0] > 180 && idColor[1] > 180 && idColor[2] > 180 ? "black" : "white";
			}
			idtag.classList.add("id-tag");
			idtag.style.setProperty("border", "1px solid " + borderColorID);
			idtag.style.setProperty("background", bgColorID);
			let idinner = idtag.querySelector(".role-inner");
			idinner.style.setProperty("color", textColorID);
			idinner.style.setProperty("background-image", bgInnerID); 
			idinner.style.setProperty("-webkit-background-clip", "text");
			idinner.textContent = info.id;
		}
	}
}

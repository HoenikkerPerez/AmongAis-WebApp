import AuthManager from "../clients/game-client"
import defaultExport from "../clients/game-client"
import model from "../model/model"

function login(username){
    model.setLogin(AuthManager.login(username));
}
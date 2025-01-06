package space.createyourhumanity.app.web.rest;

import java.util.Collections;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.AccessTokenResponse;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/keycloak")
public class KeycloakController {

    private final Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    public KeycloakController(Keycloak keycloak) {
        this.keycloak = keycloak;
    }

    @PutMapping("/users/{userId}/picture")
    public ResponseEntity<Void> updateUserPicture(@PathVariable String userId, @RequestBody String pictureUrl) {
        UserResource userResource = keycloak.realm(realm).users().get(userId);
        UserRepresentation user = userResource.toRepresentation();

        user.singleAttribute("picture", pictureUrl);

        userResource.update(user);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/token")
    public ResponseEntity<String> getToken() {
        // Hole den aktuell authentifizierten Keycloak-Benutzer
        AccessTokenResponse accessTokenResponse = keycloak.tokenManager().getAccessToken();

        // Extrahiere das Token aus der Antwort
        String token = accessTokenResponse.getToken();

        return ResponseEntity.ok(token);
    }
}

package space.createyourhumanity.app.web.rest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import space.createyourhumanity.app.domain.User;
import space.createyourhumanity.app.service.UserService;

@RestController
@RequestMapping(
    value = "/api",
    produces = "application/json",
    method = { RequestMethod.POST, RequestMethod.PUT, RequestMethod.GET, RequestMethod.DELETE }
)
public class ProfilePictureController {

    private final UserService userService;
    private final String uploadDir = "src/main/webapp/content/profileimages/";

    @Autowired
    private Keycloak keycloak;

    public ProfilePictureController(UserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/users/upload-profile-picture", produces = "application/json", method = RequestMethod.PUT)
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<String> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload");
        }

        try {
            User currentUser = userService.getUserWithAuthorities();
            String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String fileName = "profile_" + currentUser.getId() + "." + fileExtension;
            Path path = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            String imageUrl = "/content/profileimages/" + currentUser.getId();
            currentUser.setImageUrl(imageUrl);

            // Update Keycloak
            UserResource userResource = keycloak.realm("heartfull-mind-ecosystems-realm").users().get(currentUser.getId());
            UserRepresentation userRepresentation = userResource.toRepresentation();
            userRepresentation.singleAttribute("picture", imageUrl);
            userResource.update(userRepresentation);

            userService.updateUser(
                currentUser.getFirstName(),
                currentUser.getLastName(),
                currentUser.getEmail(),
                currentUser.getLangKey(),
                imageUrl,
                currentUser.getBio()
            );
            return ResponseEntity.ok("Profile picture uploaded successfully");
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not upload file");
        }
    }

    @PutMapping("/profile-picture/{userId}")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable String userId) {
        try {
            User user = userService.getUserWithAuthorities();
            Path userProfilePicturePath = Paths.get(uploadDir, user.getId());

            if (Files.exists(userProfilePicturePath)) {
                // Wenn das Profilbild für den Benutzer existiert, gib es zurück
                byte[] imageBytes = Files.readAllBytes(userProfilePicturePath);
                return ResponseEntity.ok().body(imageBytes);
            } else {
                // Wenn kein Profilbild für den Benutzer existiert, gib das Standard-Bild zurück
                Path defaultProfilePicturePath = Paths.get(uploadDir, "default-user.png");
                byte[] defaultImageBytes = Files.readAllBytes(defaultProfilePicturePath);
                return ResponseEntity.ok().body(defaultImageBytes);
            }
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/profile-picture-url/{userId}")
    public ResponseEntity<String> getProfilePictureUrl(@PathVariable String userId) {
        try {
            User user = userService.getUserWithAuthorities();
            Path userProfilePicturePath = Paths.get(uploadDir, user.getId());

            if (Files.exists(userProfilePicturePath)) {
                // Wenn das Profilbild für den Benutzer existiert, gib die URL zurück
                String imageUrl = "/content/profileimages/" + user.getId();
                return ResponseEntity.ok(imageUrl);
            } else {
                // Wenn kein Profilbild für den Benutzer existiert, gib die URL des
                // Standard-Bilds zurück
                String defaultImageUrl = "/content/profileimages/default-user.png";
                return ResponseEntity.ok(defaultImageUrl);
            }
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}

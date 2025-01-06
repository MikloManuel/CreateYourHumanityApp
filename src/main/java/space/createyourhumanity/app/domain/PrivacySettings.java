package space.createyourhumanity.app.domain;

import java.io.Serializable;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A PrivacySettings.
 */
@Document(collection = "privacy_settings")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "privacysettings")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PrivacySettings implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Field("settings_map")
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Text)
    private String settingsMap;

    @DBRef
    @Field("user")
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public PrivacySettings id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSettingsMap() {
        return this.settingsMap;
    }

    public PrivacySettings settingsMap(String settingsMap) {
        this.setSettingsMap(settingsMap);
        return this;
    }

    public void setSettingsMap(String settingsMap) {
        this.settingsMap = settingsMap;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public PrivacySettings user(User user) {
        this.setUser(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PrivacySettings)) {
            return false;
        }
        return getId() != null && getId().equals(((PrivacySettings) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PrivacySettings{" +
            "id=" + getId() +
            ", settingsMap='" + getSettingsMap() + "'" +
            "}";
    }
}

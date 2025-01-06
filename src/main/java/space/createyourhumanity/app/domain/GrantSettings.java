package space.createyourhumanity.app.domain;

import java.io.Serializable;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A GrantSettings.
 */
@Document(collection = "grant_settings")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "grantsettings")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class GrantSettings implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Field("grant_map")
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Text)
    private String grantMap;

    @DBRef
    @Field("user")
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public GrantSettings id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getGrantMap() {
        return this.grantMap;
    }

    public GrantSettings grantMap(String grantMap) {
        this.setGrantMap(grantMap);
        return this;
    }

    public void setGrantMap(String grantMap) {
        this.grantMap = grantMap;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public GrantSettings user(User user) {
        this.setUser(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof GrantSettings)) {
            return false;
        }
        return getId() != null && getId().equals(((GrantSettings) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "GrantSettings{" +
            "id=" + getId() +
            ", grantMap='" + getGrantMap() + "'" +
            "}";
    }
}

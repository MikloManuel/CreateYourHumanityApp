package space.createyourhumanity.app.domain;

import java.io.Serializable;
import java.time.ZonedDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A Friendrequest.
 */
@Document(collection = "friendrequest")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "friendrequest")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Friendrequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Field("request_date")
    private ZonedDateTime requestDate;

    @Field("request_user_id")
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Text)
    private String requestUserId;

    @Field("info")
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Text)
    private String info;

    @DBRef
    @Field("user")
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public Friendrequest id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ZonedDateTime getRequestDate() {
        return this.requestDate;
    }

    public Friendrequest requestDate(ZonedDateTime requestDate) {
        this.setRequestDate(requestDate);
        return this;
    }

    public void setRequestDate(ZonedDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public String getRequestUserId() {
        return this.requestUserId;
    }

    public Friendrequest requestUserId(String requestUserId) {
        this.setRequestUserId(requestUserId);
        return this;
    }

    public void setRequestUserId(String requestUserId) {
        this.requestUserId = requestUserId;
    }

    public String getInfo() {
        return this.info;
    }

    public Friendrequest info(String info) {
        this.setInfo(info);
        return this;
    }

    public void setInfo(String info) {
        this.info = info;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Friendrequest user(User user) {
        this.setUser(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Friendrequest)) {
            return false;
        }
        return getId() != null && getId().equals(((Friendrequest) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Friendrequest{" +
            "id=" + getId() +
            ", requestDate='" + getRequestDate() + "'" +
            ", requestUserId='" + getRequestUserId() + "'" +
            ", info='" + getInfo() + "'" +
            "}";
    }
}

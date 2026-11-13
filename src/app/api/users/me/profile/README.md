## Database Architecture:
```SQL
    CREATE TABLE core.user_profiles (
        -- Primary relationship
        user_id UUID PRIMARY KEY
            REFERENCES core.users(id) ON DELETE CASCADE,

        -- Profile information
        display_name VARCHAR(150),
        bio TEXT,
        avatar_url TEXT,
        cover_image_url TEXT,

        -- Personal information
        date_of_birth DATE,
        gender VARCHAR(20),

        -- Contact and location
        alternate_email VARCHAR(255),
        alternate_mobile VARCHAR(20),

        address_line_1 VARCHAR(255),
        address_line_2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),

        -- Social profiles
        website_url TEXT,
        linkedin_url TEXT,
        twitter_url TEXT,

        -- Preferences
        timezone VARCHAR(100) DEFAULT 'UTC',
        locale VARCHAR(20) DEFAULT 'en',
        preferences JSONB NOT NULL DEFAULT '{}'::JSONB,

        -- Profile visibility
        is_public BOOLEAN NOT NULL DEFAULT FALSE,

        -- Audit information
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
```



| Column name        | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `user_id`          | Unique identifier of the user; connects the profile with `core.users`.  |
| `display_name`     | User's display name.                                                    |
| `bio`              | Short description or introduction about the user.                       |
| `avatar_url`       | URL or storage path of the user's profile picture.                      |
| `cover_image_url`  | URL or storage path of the user's profile cover image.                  |
| `date_of_birth`    | User's date of birth.                                                   |
| `gender`           | User's gender.                                                          |
| `alternate_email`  | User's secondary email address.                                         |
| `alternate_mobile` | User's secondary mobile number.                                         |
| `address_line_1`   | Primary residential address, such as house number and street.           |
| `address_line_2`   | Additional residential address, such as apartment, landmark or area.    |
| `city`             | User's city.                                                            |
| `state`            | User's state or province.                                               |
| `country`          | User's country.                                                         |
| `postal_code`      | Postal code, PIN code or ZIP code.                                      |
| `website_url`      | User's personal website or portfolio URL.                               |
| `linkedin_url`     | User's LinkedIn profile URL.                                            |
| `twitter_url`      | User's Twitter/X profile URL.                                           |
| `timezone`         | User's preferred timezone for displaying dates and times.               |
| `locale`           | User's preferred language and regional settings.                        |
| `preferences`      | Stores additional user-specific application preferences in JSON format. |
| `is_public`        | Determines whether the user's profile is marked as publicly visible.    |
| `created_at`       | Date and time when the profile record was created.                      |
| `updated_at`       | Date and time when the profile record was last updated.                 |

# IVR

## Table of Contents

*   [1\. IVR Settings Document](#sec-1)
    *   [1.1\. System Settings](#sec-1-1)
    *   [1.2\. Node Settings](#sec-1-2)
        *   [1.2.1\. What is a node?](#sec-1-2-1)
        *   [1.2.2\. Node Method](#sec-1-2-2)
        *   [1.2.3\. General Node Settings](#sec-1-2-3)
        *   [1.2.4\. Say Settings](#sec-1-2-4)
        *   [1.2.5\. Gather Settings](#sec-1-2-5)
        *   [1.2.6\. Split Settings](#sec-1-2-6)
        *   [1.2.7\. Split Condition Settings](#sec-1-2-7)
        *   [1.2.8\. Action Settings](#sec-1-2-8)


## 1 IVR Settings Document

The IVR settings document is a JSON document that describes the behavior of a custom IVR solution. There are two types of settings defined in the document: system settings, and node settings.

### 1.1 System Settings

System Settings are settings that pertain to the IVR system as a whole. Things like the default language, and phone number for accessing the IVR are examples of system settings. These settings are defined at the root level of the document.

| Name | Required/Optional | Description | Possible Values |
|------|-------------------|-------------|-----------------|
| domain | required | The unique identifier of the agency using the IVR | any string |
| access_number | required | The phone number users dial to access the IVR | {+xxxxxxxxxxx} where x is any integer |
| default_voice | optional | The voice that will be used if no voice is specified in a node | see [https://www.twilio.com/docs/api/twiml/say](https://www.twilio.com/docs/api/twiml/say) |
| default_language | optional | The language that will be used if no language is specified in a node | see [https://www.twilio.com/docs/api/twiml/say](https://www.twilio.com/docs/api/twiml/say) |
| default_timeout | optional | The timout in seconds that will be used if no timeout is specified in a node | any integer |
| model | optional | JSON object representing the initial state of the ivr-session model | any valid JSON object |
| default_error_redirect | required | The id of the node to redirect to if no error<sub>redirect</sub> is defined for the node | the id of any node in the ivr |

### 1.2 Node Settings

#### 1.2.1 What is a node?

The IVR can be thought of as a collection of nodes in a graph. See [this wiki](https://en.wikipedia.org/wiki/Graph_theory) if you are unfamiliar with this concept. Each node can be though of as a point of interaction between the user and IVR.

#### 1.2.2 Node Method

Each node has a method, which defines the nodes general behavior. The method types are defined as such:

| Name | Description |
|----------|-----------------|
| Say | Simply reads a predefined string of text to the user. Content strings can by static or dynamic using a handlebars style template. |
| Gather | Takes input from the user's touch-tone keypad and performs an action on said input. |
| Split | Takes input from the user's touch-tone keypad and redirects to another node based on the user's input. |
| Split_condition | Performs a split based on a condition defined as a libary function, rather than user input |
| Hangup | Ends the call. |
| Action | Performs an action without accepting any input. Only can call library functions that don't take any input |


#### 1.2.3 General Node Settings

These settings are applicable to nodes of most if not all methods

| Name | Required/Optional | Description | Possible Values |
|----------|-----------------------|-----------------|---------------------|
| id | required | unique identifier for the node | any string |
| method | required | see _Node Method_ | see _Node Method_ |
| voice | optional | the twilio voice that will be used for this node | see [https://www.twilio.com/docs/api/twiml/say](https://www.twilio.com/docs/api/twiml/say) |
| language | optional | the twilio language that will be used for this node | see [https://www.twilio.com/docs/api/twiml/say](https://www.twilio.com/docs/api/twiml/say) |
| error_redirect | optional | the id of the node to redirect to if an error is thrown | the id of any node in the ivr |

#### 1.2.4 Say Settings

These settings are applicable only to say nodes

| Name | Required/Optional | Description | Possible Values |
|----------|-----------------------|-----------------|---------------------|
| template | required | handlebars template describing what will be said | any valid handlebars template (see [https://github.com/wycats/handlebars.js](https://github.com/wycats/handlebars.js)) |
| redirect | required | the id of the node to redirect to upon completion | the id of any other node in the ivr |

#### 1.2.5 Gather Settings

These settings are applicable only to gather nodes

| Name | Required/Optional | Description | Possible Values |
|----------|-----------------------|-----------------|---------------------|
| prompt | required | the string that will be read before accepting user input | any string (note: currently not supporting handlebars templates) |
| timeout | optional | the number of seconds the system will wait for input before hanging up | any positive integer (values over 20 are discouraged) |
| numDigits | optional if finishOnKey defined | the number of digits of user input to accept | any positive integer (values over 20 are discouraged) |
| finishOnKey | optional if numDigits is defined | the system will stop collecting user input when the user presses this key | any of the following: [0, 1, 2, 4, 5, 6, 7, 8, 9, *, #] |
| redirect | required | the id of the node to redirect to upon completion | the id of any other node in the ivr |
| action | required | the name of an action defined in the IVR library | the name of any action in the IVR library |

#### 1.2.6 Split Settings

These settings are applicable only to split nodes

| Name | Required/Optional | Description | Possible Values |
|----------|-----------------------|-----------------|---------------------|
| timeout | optional | the number of seconds the system will wait for user input before hanging up | any positive integer (values over 20 are discouraged) |
| paths | required | a JSON array of objects describing the possible options (see _Paths_) | see _Paths_ |
| invalid_input_redirect | required | id of the node to redirect to if the user enters invalid input | the id of any other node in the ivr |

1.  Paths

    The paths setting of a split node is defined as an array of JSON objects. The array must contain at least 1 object and at most 10 objects. Each path object is defined as such:

    | Name | Required/Optional | Description | Possible Values |
    |----------|-----------------------|-----------------|---------------------|
    | key | required | the key pressed by the user to choose this path | any single digit integer |
    | prompt | required | what will be read to the user as a description of this path | any string |
    | redirect | required | the id of the node to redirect to if this path is chosen | the id of any node in the ivr |

    These paths will be read to the user in the form of: "Press [key] to [prompt]"

#### 1.2.7 Split Condition Settings

| Name | Required/Optional | Description | Possible Values |
|----------|-----------------------|-----------------|---------------------|
| timeout | optional | the number of seconds the system will wait for user input before hanging up | any positive integer (values over 20 are discouraged) |
| paths | required | a JSON array of objects describing the possible options (see _Paths_) | see _Paths_ |
| default_redirect | required | id of the node to redirect to if none of the conditions are met | the id of any other node in the ivr |

1.  Condition Paths

    The paths setting of a condition_split node is defined as an array of JSON objects. The array must contain at least 1 object. Each path object is defined as such:

    | Name | Required/Optional | Description | Possible Values |
    |------|-------------------|-------------|-----------------|
    | condition | required | The name of the boolean returning function defined in the library | the string representation of any function in the library returning a boolean value |
    | redirect | required | the id of the node to redirect to if this condition is met | the id of any node in the ivr |

#### 1.2.8 Action Settings

These settings are applicable only to action nodes

| Name | Required/Optional | Description | Possible Values |
|----------|-----------------------|-----------------|---------------------|
| action | required | the name of the library function to call | any valid library function that doesn't take input |
| redirect | required | the id of the node to redirect to after completing the action | the id of any other node in the ivr |

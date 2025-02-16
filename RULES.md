Craft Ping Docs:

Crate craftping
source · [−]

craftping provides a ping function to send Server List Ping requests to a Minecraft server.
Feature flags

    sync (default): Enables synchronous, blocking ping function.
    async-tokio: Enables asynchronous, tokio-based ping function.
    async-futures: Enables asynchronous, futures-based ping function.

Examples

use craftping::sync::ping;
use std::net::TcpStream;

fn main() {
    let hostname = "my.server.com";
    let port = 25565;
    let mut stream = TcpStream::connect((hostname, port)).unwrap();
    let response = ping(&mut stream, hostname, port).unwrap();
    println!("Players online: {}", response.online_players);
}

Modules
futures
Provides asynchronous ping function. (especially for futures-io compatible streams)
sync
Provides synchronous, blocking ping function.
tokio
Provides asynchronous ping function. (especially for tokio streams)
Structs
Chat
The chat component used in the server description.
ForgeChannel
The information of the channels used by the mods.
ForgeData
The forge information object used in FML2 protocol (version 1.13 - current).
ForgeMod
The information of an installed mod.
ModInfo
The mod information object used in FML protocol (version 1.7 - 1.12).
ModInfoItem
The information of an installed mod.
Player
The sample players’ information.
Response
A ping response returned from server.
Enums
Error
The ping error type.
Type Definitions
Result
The ping result type.

Struct craftping::Chat
source · [−]

pub struct Chat {
    pub text: String,
    pub bold: bool,
    pub italic: bool,
    pub underlined: bool,
    pub strikethrough: bool,
    pub obfuscated: bool,
    pub color: Option<String>,
    pub extra: Vec<Chat>,
}

The chat component used in the server description.

See also the minecraft protocol wiki.
Fields
text: String

The text which this Chat object holds.
bold: bool

true if the text and the extras should be bold.
italic: bool

true if the text and the extras should be italic.
underlined: bool

true if the text and the extras should be underlined.
strikethrough: bool

true if the text and the extras should have a strikethrough.
obfuscated: bool

true if the text and the extras should look obfuscated.
color: Option<String>

The color which the text and the extras should have. None to use default color.
extra: Vec<Chat>

The extra text components following this text. They should inherit this chat component’s properties (bold, italic, etc.) but can also override the properties.
Trait Implementations
source
impl Clone for Chat
source
fn clone(&self) -> Chat
Returns a copy of the value. Read more
1.0.0 · source
fn clone_from(&mut self, source: &Self)
Performs copy-assignment from source. Read more
source
impl Debug for Chat
source
fn fmt(&self, f: &mut Formatter<'_>) -> Result
Formats the value using the given formatter. Read more
source
impl Default for Chat
source
fn default() -> Chat
Returns the “default value” for a type. Read more
source
impl<'de> Deserialize<'de> for Chat
source
fn deserialize<__D>(__deserializer: __D) -> Result<Self, __D::Error>where
    __D: Deserializer<'de>,
Deserialize this value from the given Serde deserializer. Read more
Auto Trait Implementations
impl RefUnwindSafe for Chat
impl Send for Chat
impl Sync for Chat
impl Unpin for Chat
impl UnwindSafe for Chat
Blanket Implementations
source
impl<T> Any for Twhere
    T: 'static + ?Sized,
source
impl<T> Borrow<T> for Twhere
    T: ?Sized,
source
impl<T> BorrowMut<T> for Twhere
    T: ?Sized,
source
impl<T> From<T> for T

source
impl<T, U> Into<U> for Twhere
    U: From<T>,

source
impl<T> ToOwned for Twhere
    T: Clone,
source
impl<T, U> TryFrom<U> for Twhere
    U: Into<T>,
source
impl<T, U> TryInto<U> for Twhere
    U: TryFrom<T>,
source
impl<T> DeserializeOwned for Twhere
    T: for<'de> Deserialize<'de>,

    Struct craftping::ForgeChannel
source · [−]

pub struct ForgeChannel {
    pub res: String,
    pub version: String,
    pub required: bool,
}

The information of the channels used by the mods.

See the minecraft protocol wiki for more information. Unfortunately, the exact semantics of its field is currently not found. We do not guarantee the document is right, and you should re-check the values you’ve received.
Fields
res: String

The namespaced key of the channel
version: String

The version of the channel
required: bool

true if it is required
Trait Implementations
source
impl Clone for ForgeChannel
source
fn clone(&self) -> ForgeChannel
Returns a copy of the value. Read more
1.0.0 · source
fn clone_from(&mut self, source: &Self)
Performs copy-assignment from source. Read more
source
impl Debug for ForgeChannel
source
fn fmt(&self, f: &mut Formatter<'_>) -> Result
Formats the value using the given formatter. Read more
source
impl<'de> Deserialize<'de> for ForgeChannel
source
fn deserialize<__D>(__deserializer: __D) -> Result<Self, __D::Error>where
    __D: Deserializer<'de>,
Deserialize this value from the given Serde deserializer. Read more
Auto Trait Implementations
impl RefUnwindSafe for ForgeChannel
impl Send for ForgeChannel
impl Sync for ForgeChannel
impl Unpin for ForgeChannel
impl UnwindSafe for ForgeChannel
Blanket Implementations
source
impl<T> Any for Twhere
    T: 'static + ?Sized,
source
impl<T> Borrow<T> for Twhere
    T: ?Sized,
source
impl<T> BorrowMut<T> for Twhere
    T: ?Sized,
source
impl<T> From<T> for T

source
impl<T, U> Into<U> for Twhere
    U: From<T>,

source
impl<T> ToOwned for Twhere
    T: Clone,
source
impl<T, U> TryFrom<U> for Twhere
    U: Into<T>,
source
impl<T, U> TryInto<U> for Twhere
    U: TryFrom<T>,
source
impl<T> DeserializeOwned for Twhere
    T: for<'de> Deserialize<'de>,

    Struct craftping::ForgeData
source · [−]

pub struct ForgeData {
    pub channels: Vec<ForgeChannel>,
    pub mods: Vec<ForgeMod>,
    pub fml_network_version: String,
}

The forge information object used in FML2 protocol (version 1.13 - current).
Fields
channels: Vec<ForgeChannel>

The list of the channels used by the mods. See the minecraft protocol wiki for more information.
mods: Vec<ForgeMod>

The list of the mods installed on the server.
fml_network_version: String
Trait Implementations
source
impl Clone for ForgeData
source
fn clone(&self) -> ForgeData
Returns a copy of the value. Read more
1.0.0 · source
fn clone_from(&mut self, source: &Self)
Performs copy-assignment from source. Read more
source
impl Debug for ForgeData
source
fn fmt(&self, f: &mut Formatter<'_>) -> Result
Formats the value using the given formatter. Read more
source
impl<'de> Deserialize<'de> for ForgeData
source
fn deserialize<__D>(__deserializer: __D) -> Result<Self, __D::Error>where
    __D: Deserializer<'de>,
Deserialize this value from the given Serde deserializer. Read more
Auto Trait Implementations
impl RefUnwindSafe for ForgeData
impl Send for ForgeData
impl Sync for ForgeData
impl Unpin for ForgeData
impl UnwindSafe for ForgeData
Blanket Implementations
source
impl<T> Any for Twhere
    T: 'static + ?Sized,
source
impl<T> Borrow<T> for Twhere
    T: ?Sized,
source
impl<T> BorrowMut<T> for Twhere
    T: ?Sized,
source
impl<T> From<T> for T

source
impl<T, U> Into<U> for Twhere
    U: From<T>,

source
impl<T> ToOwned for Twhere
    T: Clone,
source
impl<T, U> TryFrom<U> for Twhere
    U: Into<T>,
source
impl<T, U> TryInto<U> for Twhere
    U: TryFrom<T>,
source
impl<T> DeserializeOwned for Twhere
    T: for<'de> Deserialize<'de>,

    Struct craftping::ForgeMod
source · [−]

pub struct ForgeMod {
    pub mod_id: String,
    pub mod_marker: String,
}

The information of an installed mod.
Fields
mod_id: String

The id of the mod.
mod_marker: String

The version of the mod.
Trait Implementations
source
impl Clone for ForgeMod
source
fn clone(&self) -> ForgeMod
Returns a copy of the value. Read more
1.0.0 · source
fn clone_from(&mut self, source: &Self)
Performs copy-assignment from source. Read more
source
impl Debug for ForgeMod
source
fn fmt(&self, f: &mut Formatter<'_>) -> Result
Formats the value using the given formatter. Read more
source
impl<'de> Deserialize<'de> for ForgeMod
source
fn deserialize<__D>(__deserializer: __D) -> Result<Self, __D::Error>where
    __D: Deserializer<'de>,
Deserialize this value from the given Serde deserializer. Read more
Auto Trait Implementations
impl RefUnwindSafe for ForgeMod
impl Send for ForgeMod
impl Sync for ForgeMod
impl Unpin for ForgeMod
impl UnwindSafe for ForgeMod
Blanket Implementations
source
impl<T> Any for Twhere
    T: 'static + ?Sized,
source
impl<T> Borrow<T> for Twhere
    T: ?Sized,
source
impl<T> BorrowMut<T> for Twhere
    T: ?Sized,
source
impl<T> From<T> for T

source
impl<T, U> Into<U> for Twhere
    U: From<T>,

source
impl<T> ToOwned for Twhere
    T: Clone,
source
impl<T, U> TryFrom<U> for Twhere
    U: Into<T>,
source
impl<T, U> TryInto<U> for Twhere
    U: TryFrom<T>,
source
impl<T> DeserializeOwned for Twhere
    T: for<'de> Deserialize<'de>,

    Struct craftping::ModInfo
source · [−]

pub struct ModInfo {
    pub mod_type: String,
    pub mod_list: Vec<ModInfoItem>,
}

The mod information object used in FML protocol (version 1.7 - 1.12).
Fields
mod_type: String

The field type of modinfo. It should be FML if forge is installed.
mod_list: Vec<ModInfoItem>

The list of the mod installed on the server. See also ModInfoItem
Trait Implementations
source
impl Clone for ModInfo
source
fn clone(&self) -> ModInfo
Returns a copy of the value. Read more
1.0.0 · source
fn clone_from(&mut self, source: &Self)
Performs copy-assignment from source. Read more
source
impl Debug for ModInfo
source
fn fmt(&self, f: &mut Formatter<'_>) -> Result
Formats the value using the given formatter. Read more
source
impl<'de> Deserialize<'de> for ModInfo
source
fn deserialize<__D>(__deserializer: __D) -> Result<Self, __D::Error>where
    __D: Deserializer<'de>,
Deserialize this value from the given Serde deserializer. Read more
Auto Trait Implementations
impl RefUnwindSafe for ModInfo
impl Send for ModInfo
impl Sync for ModInfo
impl Unpin for ModInfo
impl UnwindSafe for ModInfo
Blanket Implementations
source
impl<T> Any for Twhere
    T: 'static + ?Sized,
source
impl<T> Borrow<T> for Twhere
    T: ?Sized,
source
impl<T> BorrowMut<T> for Twhere
    T: ?Sized,
source
impl<T> From<T> for T

source
impl<T, U> Into<U> for Twhere
    U: From<T>,

source
impl<T> ToOwned for Twhere
    T: Clone,
source
impl<T, U> TryFrom<U> for Twhere
    U: Into<T>,
source
impl<T, U> TryInto<U> for Twhere
    U: TryFrom<T>,
source
impl<T> DeserializeOwned for Twhere
    T: for<'de> Deserialize<'de>,

    Struct craftping::ModInfoItem
source · [−]

pub struct ModInfoItem {
    pub mod_id: String,
    pub version: String,
}

The information of an installed mod.
Fields
mod_id: String

The id of the mod.
version: String

The version of the mod.
Trait Implementations
source
impl Clone for ModInfoItem
source
fn clone(&self) -> ModInfoItem
Returns a copy of the value. Read more
1.0.0 · source
fn clone_from(&mut self, source: &Self)
Performs copy-assignment from source. Read more
source
impl Debug for ModInfoItem
source
fn fmt(&self, f: &mut Formatter<'_>) -> Result
Formats the value using the given formatter. Read more
source
impl<'de> Deserialize<'de> for ModInfoItem
source
fn deserialize<__D>(__deserializer: __D) -> Result<Self, __D::Error>where
    __D: Deserializer<'de>,
Deserialize this value from the given Serde deserializer. Read more
Auto Trait Implementations
impl RefUnwindSafe for ModInfoItem
impl Send for ModInfoItem
impl Sync for ModInfoItem
impl Unpin for ModInfoItem
impl UnwindSafe for ModInfoItem
Blanket Implementations
source
impl<T> Any for Twhere
    T: 'static + ?Sized,
source
impl<T> Borrow<T> for Twhere
    T: ?Sized,
source
impl<T> BorrowMut<T> for Twhere
    T: ?Sized,
source
impl<T> From<T> for T

source
impl<T, U> Into<U> for Twhere
    U: From<T>,

source
impl<T> ToOwned for Twhere
    T: Clone,
source
impl<T, U> TryFrom<U> for Twhere
    U: Into<T>,
source
impl<T, U> TryInto<U> for Twhere
    U: TryFrom<T>,
source
impl<T> DeserializeOwned for Twhere
    T: for<'de> Deserialize<'de>,

    Struct craftping::Player
source · [−]

pub struct Player {
    pub name: String,
    pub id: String,
}

The sample players’ information.
Fields
name: String

The name of the player.
id: String

The uuid of the player. Normally used to identify a player.
Trait Implementations
source
impl Clone for Player
source
fn clone(&self) -> Player
Returns a copy of the value. Read more
1.0.0 · source
fn clone_from(&mut self, source: &Self)
Performs copy-assignment from source. Read more
source
impl Debug for Player
source
fn fmt(&self, f: &mut Formatter<'_>) -> Result
Formats the value using the given formatter. Read more
source
impl<'de> Deserialize<'de> for Player
source
fn deserialize<__D>(__deserializer: __D) -> Result<Self, __D::Error>where
    __D: Deserializer<'de>,
Deserialize this value from the given Serde deserializer. Read more
Auto Trait Implementations
impl RefUnwindSafe for Player
impl Send for Player
impl Sync for Player
impl Unpin for Player
impl UnwindSafe for Player
Blanket Implementations
source
impl<T> Any for Twhere
    T: 'static + ?Sized,
source
impl<T> Borrow<T> for Twhere
    T: ?Sized,
source
impl<T> BorrowMut<T> for Twhere
    T: ?Sized,
source
impl<T> From<T> for T

source
impl<T, U> Into<U> for Twhere
    U: From<T>,

source
impl<T> ToOwned for Twhere
    T: Clone,
source
impl<T, U> TryFrom<U> for Twhere
    U: Into<T>,
source
impl<T, U> TryInto<U> for Twhere
    U: TryFrom<T>,
source
impl<T> DeserializeOwned for Twhere
    T: for<'de> Deserialize<'de>,

    Struct craftping::Response
source · [−]

pub struct Response {
    pub version: String,
    pub protocol: i32,
    pub max_players: usize,
    pub online_players: usize,
    pub sample: Option<Vec<Player>>,
    pub description: Chat,
    pub favicon: Option<Vec<u8>>,
    pub mod_info: Option<ModInfo>,
    pub forge_data: Option<ForgeData>,
}

A ping response returned from server.
Fields
version: String

The version name of the server.
protocol: i32

The protocol number of the server. See also the minecraft protocol wiki for the actual values.
max_players: usize

The maximum number of the connected players.
online_players: usize

The number of the players currently connected.
sample: Option<Vec<Player>>

The sample of the connected players. Note that it can be None even if some players are connected.
description: Chat

The description (aka MOTD) of the server. See also the minecraft protocol wiki for the Chat format.
favicon: Option<Vec<u8>>

The favicon of the server in PNG format.
mod_info: Option<ModInfo>

The mod information object used in FML protocol (version 1.7 - 1.12). See also the minecraft protocol wiki for the ModInfo format.
forge_data: Option<ForgeData>

The forge information object used in FML2 protocol (version 1.13 - current). See also the minecraft protocol wiki for the ForgeData format.
Trait Implementations
source
impl Clone for Response
source
fn clone(&self) -> Response
Returns a copy of the value. Read more
1.0.0 · source
fn clone_from(&mut self, source: &Self)
Performs copy-assignment from source. Read more
source
impl Debug for Response
source
fn fmt(&self, f: &mut Formatter<'_>) -> Result
Formats the value using the given formatter. Read more
Auto Trait Implementations
impl RefUnwindSafe for Response
impl Send for Response
impl Sync for Response
impl Unpin for Response
impl UnwindSafe for Response
Blanket Implementations
source
impl<T> Any for Twhere
    T: 'static + ?Sized,
source
impl<T> Borrow<T> for Twhere
    T: ?Sized,
source
impl<T> BorrowMut<T> for Twhere
    T: ?Sized,
source
impl<T> From<T> for T

source
impl<T, U> Into<U> for Twhere
    U: From<T>,

source
impl<T> ToOwned for Twhere
    T: Clone,
source
impl<T, U> TryFrom<U> for Twhere
    U: Into<T>,
source
impl<T, U> TryInto<U> for Twhere
    U: TryFrom<T>,


    --- test minecraft server chanyan.g.akliz.net:28650
import { useState, useEffect } from "react";
import { sendToContentScript, sendToBackgroundScript } from "../utils/chrome";
import "./Popup.css";

const App = () => {
	const [textEditingEnabled, setTextEditingEnabled] = useState(true);
	const [imageEditingEnabled, setImageEditingEnabled] = useState(true);
	const [showEditsEnabled, setShowEditsEnabled] = useState(true);
	const [pageUrl, setPageUrl] = useState("google.com");
	const [edits, setEdits] = useState([
		// { type: "txt", content: "22222.." },
		// { type: "img", content: "33333.." },
	]);

	useEffect(() => {
		const init = async () => {
			const { textEditingEnabled, imageEditingEnabled, showEditsEnabled } = await chrome.storage.sync.get([
				"textEditingEnabled",
				"imageEditingEnabled",
				"showEditsEnabled",
			]);
			setTextEditingEnabled(textEditingEnabled);
			setImageEditingEnabled(imageEditingEnabled);
			setShowEditsEnabled(showEditsEnabled);
		};
		init();
	}, []);

	const handleOverlayClick = async () => {
		console.log("clicked overlay");

		await sendToContentScript({ command: "createOverlay" });
	};

	const handleTextEditingClick = async () => {
		const newState = !textEditingEnabled;
		setTextEditingEnabled(newState);
		console.log(`text editing ${newState ? "enabled" : "disabled"}`);

		await sendToBackgroundScript({ textEditingEnabled: newState });
	};

	const handleImageEditingClick = async () => {
		const newState = !imageEditingEnabled;
		setImageEditingEnabled(newState);
		console.log(`image editing ${newState ? "enabled" : "disabled"}`);

		await sendToBackgroundScript({ imageEditingEnabled: newState });
	};

	const handleShowEditsClick = async () => {
		const newState = !showEditsEnabled;
		setShowEditsEnabled(newState);
		console.log(`show edits ${newState ? "enabled" : "disabled"}`);

		await sendToBackgroundScript({ showEditsEnabled: newState });
	};

	const handleClearEdits = async (event) => {
		await sendToContentScript({ command: "clearStorage" });
		// bugs when hasn't loaded into any content script yet. probably need to go through background script instead
		setEdits([]);
		// console log all of the computed styles on the event.target, in a format to be able to copy and paste to a .css file
		console.log([...event.target.computedStyleMap().entries()].map(([key, value]) => `${key}: ${value};`).join("\n"));
	};

	const handleDeleteEdit = (index) => {
		console.log("delete edit", index);
		setEdits(edits.filter((_, i) => i !== index));
	};

	return (
		<main data-theme="night">
			<div className="card w-96 bg-base-100 shadow-xl">
				<div className="card-body">
					<div className="">
						<h2 className="card-title justify-center mb-0 pb-0">{process.env.PROJECT_NAME}</h2>
						<h3 className="m-0 p-0 text-center">v{process.env.VERSION}</h3>
					</div>
					<div className="font-medium text-lg">Actions</div>
					<div className="flex justify-between items-center">
						<div className="flex gap-2">
							<Button tooltip={"Create Overlay"} onClick={handleOverlayClick} className={"btn-secondary"}>
								<OverlaySVG className={"fill-secondary-content"} />
							</Button>
							<Button
								tooltip={textEditingEnabled ? "Disable Text Editing" : "Enable Text Editing"}
								onClick={handleTextEditingClick}
								className={textEditingEnabled ? "btn-primary" : ""}
							>
								<TextEditSVG className={textEditingEnabled ? "fill-primary-content" : "fill-base-content"} />
							</Button>
							<Button
								tooltip={imageEditingEnabled ? "Disable Image Editing" : "Enable Image Editing"}
								onClick={handleImageEditingClick}
								className={imageEditingEnabled ? "btn-primary" : ""}
							>
								<ImageEditSVG className={imageEditingEnabled ? "fill-primary-content" : "fill-base-content"} />
							</Button>
						</div>
						<div className="">
							<Button
								tooltip={showEditsEnabled ? "Show Edits" : "Hide Edits"}
								onClick={handleShowEditsClick}
								className={showEditsEnabled ? "btn-primary" : ""}
							>
								{showEditsEnabled ? <HideEditsSVG className={"fill-primary-content"} /> : <ShowEditsSVG className={"fill-base-content"} />}
							</Button>
						</div>
					</div>
					<div className="mt-4 flex justify-between items-center">
						<div className="font-medium text-lg">Edits</div>
						<div className="">{pageUrl}</div>
					</div>

					<div className="">
						<div className="bg-base-300 rounded-md p-2 flex justify-between items-center">
							<div>
								<span className="bg-primary text-primary-content text-xs font-medium mr-2 px-2.5 py-0.5 rounded ">{edits && edits.length}</span>
							</div>

							<button className="btn btn-xs btn-accent" onClick={handleClearEdits}>
								Clear
							</button>
						</div>
					</div>
					<div className="">
						<table className="table table-compact w-full">
							<tbody>
								{edits.map((edit, index) => (
									<TableRow key={index} type={edit.type} content={edit.content} onDelete={() => handleDeleteEdit(index)} />
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</main>
	);
};

export default App;

const Button = ({ onClick, children, className, tooltip, ...props }) => (
	<div className="tooltip" data-tip={tooltip}>
		<button onClick={onClick} className={`btn btn-square p-1 ${className}`} {...props}>
			{children}
		</button>
	</div>
);

const TableRow = ({ type, content, onDelete }) => (
	<tr className="hover justify-between">
		<th className="w-1/5">{type}</th>
		<td>{content}</td>
		<td className="w-8">
			<button className="btn btn-xs btn-square btn-ghost p-1" onClick={onDelete}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="fill-base-content">
					<path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
				</svg>
			</button>
		</td>
	</tr>
);

const OverlaySVG = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={className}>
		<path d="M0 96C0 60.7 28.7 32 64 32c106.7 0 213.3 0 320 0c35.3 0 64 28.7 64 64c0 34.2 0 68.4 0 102.6C374.1 219.5 320 287.4 320 368c0 42.5 15.1 81.6 40.3 112c-98.8 0-197.5 0-296.3 0c-35.3 0-64-28.7-64-64C0 309.3 0 202.7 0 96zM640 368c0 79.5-64.5 144-144 144s-144-64.5-144-144s64.5-144 144-144s144 64.5 144 144zM480 304l0 48c-16 0-32 0-48 0c-8.8 0-16 7.2-16 16s7.2 16 16 16c16 0 32 0 48 0l0 48c0 8.8 7.2 16 16 16s16-7.2 16-16c0-16 0-32 0-48c16 0 32 0 48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16c-16 0-32 0-48 0c0-16 0-32 0-48c0-8.8-7.2-16-16-16s-16 7.2-16 16z" />
	</svg>
);

const TextEditSVG = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={className}>
		<path d="M64 128l0 256c99.9 0 199.8 0 299.7 0c-3.5 3.5-6.9 6.9-10.4 10.4c-8.2 8.2-14 18.5-16.8 29.7c-2 8-4 15.9-6 23.9c-88.8 0-177.7 0-266.5 0c-35.3 0-64-28.7-64-64c0-85.4 0-170.7 0-256C0 92.7 28.7 64 64 64c170.7 0 341.4 0 512 0c35.3 0 64 28.7 64 64c0 29.6 0 59.1 0 88.7c-1.2-1.2-2.4-2.4-3.6-3.6c-16.5-16.5-39-23.3-60.4-20.4c0-21.6 0-43.1 0-64.7c-170.7 0-341.4 0-512 0zm120 32c9.5 0 18.1 5.6 21.9 14.3c21.3 48 42.7 96 64 144c5.4 12.1-.1 26.3-12.2 31.7s-26.3-.1-31.7-12.2c-1.4-3.2-2.9-6.5-4.3-9.7c-25.1 0-50.3 0-75.4 0c-1.4 3.2-2.9 6.5-4.3 9.7c-5.4 12.1-19.6 17.6-31.7 12.2s-17.6-19.6-12.2-31.7c21.3-48 42.7-96 64-144C166 165.6 174.5 160 184 160zm0 83.1L167.6 280c10.9 0 21.9 0 32.8 0c-5.5-12.3-10.9-24.6-16.4-36.9zM304 184c0-13.3 10.7-24 24-24c17.3 0 34.7 0 52 0c33.1 0 60 26.9 60 60c0 9.2-2.1 17.9-5.8 25.7c13.2 10.9 21.7 27.4 21.8 46c-20.1 20.1-40.2 40.2-60.3 60.3c-22.6 0-45.1 0-67.7 0c-13.3 0-24-10.7-24-24l0-8 0-64 0-64c0-2.7 0-5.3 0-8zm48 24l0 24c9.3 0 18.7 0 28 0c6.6 0 12-5.4 12-12s-5.4-12-12-12c-9.3 0-18.7 0-28 0zm0 96l44 0c6.6 0 12-5.4 12-12s-5.4-12-12-12c-5.3 0-10.7 0-16 0c-9.3 0-18.7 0-28 0c0 8 0 16 0 24zm206.2-68.1l-29.4 29.4c23.6 23.6 47.3 47.3 70.9 70.9c9.8-9.8 19.6-19.6 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6c-4.8-4.8-9.5-9.5-14.3-14.3c-15.6-15.6-40.9-15.6-56.6 0zm-52 52L376.9 417.1c-4.1 4.1-7 9.2-8.4 14.9c-5 20-10 40.1-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2c20-5 40.1-10 60.1-15c5.6-1.4 10.8-4.3 14.9-8.4C491 445 534 402 577.1 358.9c-23.7-23.7-47.3-47.3-71-71c.1 0 0 0 .1 0z" />
	</svg>
);

const ImageEditSVG = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={className}>
		<path d="M0 96C0 60.7 28.7 32 64 32c128 0 256 0 384 0c35.3 0 64 28.7 64 64c0 46.6 0 93.1 0 139.7c-32.8 32.8-65.6 65.6-98.4 98.4c-29.9-43.9-59.8-87.8-89.8-131.6c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5c-29 42.5-58 85.1-87 127.6c-8.8-11-17.7-22.1-26.5-33.1c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9c-21.3 26.7-42.7 53.3-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6c32 0 64 0 96 0c10.7 0 21.3 0 32 0c41 0 82.1 0 123.1 0c-1 2.6-1.9 5.3-2.6 8.1c-4.7 18.6-9.4 37.3-14 55.9c-86.2 0-172.3 0-258.5 0c-35.3 0-64-28.7-64-64C0 309.3 0 202.7 0 96zm112 96c17.1 0 33-9.1 41.6-24s8.6-33.1 0-48S129.1 96 112 96s-33 9.1-41.6 24s-8.6 33.1 0 48s24.4 24 41.6 24zm446.2 43.9l-29.4 29.4c23.6 23.6 47.3 47.3 70.9 70.9c9.8-9.8 19.6-19.6 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6c-4.8-4.8-9.5-9.5-14.3-14.3c-15.6-15.6-40.9-15.6-56.6 0zm-52 52L376.9 417.1c-4.1 4.1-7 9.2-8.4 14.9c-5 20-10 40.1-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2c20-5 40.1-10 60.1-15c5.6-1.4 10.8-4.3 14.9-8.4C491 445 534 402 577.1 358.9c-23.7-23.7-47.3-47.3-71-71c.1 0 0 0 .1 0z" />
	</svg>
);

const ShowEditsSVG = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={className}>
		<path d="M48.4 14.8L29.4 .1 0 38 19 52.7 591.5 497.2l19 14.7L639.9 474l-19-14.7L524 384.1c41.9-44 70.2-93.9 84-128.1C578 181.3 478.4 32 320 32c-66.9 0-123.2 26.6-168.3 63L48.4 14.8zM222.5 150c25.6-23.6 59.9-38 97.5-38c79.5 0 144 64.5 144 144c0 24.7-6.2 47.9-17.1 68.2l-38.7-30.1c5.1-11.7 7.9-24.6 7.9-38.1c0-53-43-96-96-96c-6.4 0-12.7 .6-18.8 1.8l11.6 58.2L222.5 150zM444.9 446.6L373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L85.7 163.5C60.2 197.1 42.1 230.8 32 256c30 74.7 129.6 224 288 224c46.9 0 88.6-13.1 124.9-33.4zM324.8 351.9l-99.1-78.1C234 318.3 273.1 352 320 352c1.6 0 3.2 0 4.8-.1z" />
	</svg>
);

const HideEditsSVG = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={className}>
		<path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />{" "}
	</svg>
);

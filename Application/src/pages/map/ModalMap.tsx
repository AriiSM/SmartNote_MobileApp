import React, {useEffect, useRef, useState} from "react";
import {IonAlert, IonButton, IonContent, IonHeader, IonModal, IonTitle, IonToolbar} from "@ionic/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MapComponent from "./MapComponent";
import { createAnimation } from '@ionic/react';

export interface modalProps {
    isOpen: boolean,
    setIsOpen: any,
    notebook: any,
}

const ModalMap: React.FC<modalProps> = ({isOpen, setIsOpen, notebook}) => {

    const modalEl = useRef<HTMLIonModalElement>(null);
    const enterAnimation = (baseEl: HTMLElement) => {
        const root = baseEl.shadowRoot!;

        const backdropAnimation = createAnimation()
            .addElement(root.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(root.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' },
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    };

    const leaveAnimation = (baseEl: HTMLElement) => {
        return enterAnimation(baseEl).direction('reverse');
    };
    function dismiss() {
        setIsOpen(false);
    }

    return (
        <div>
            <IonModal
                isOpen={isOpen}
                ref={modalEl} 
                enterAnimation={enterAnimation}
                leaveAnimation={leaveAnimation}
            >
                <IonHeader>
                    <IonToolbar className="home-toolbar">
                        <div className={"home-toolbar-div"}>
                            <IonButton
                                strong={true}
                                onClick={dismiss}
                                color={"danger"}
                                style={{
                                    height: 40,
                                    width: 40,
                                    paddingRight: 10,
                                }}
                            > X </IonButton>
                        </div>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-padding">
                    <MapContainer
                        id="map-container"
                        center={[46.78, 23.60]}
                        zoom={13}
                        style={{ height: '50vh', width: '100%' }}
                    >
                        <TileLayer
                            attribution="https://leafletjs.com/"
                            url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                        />
                        <MapComponent note={null} setNote={null} />

                        {notebook.notes?.map((note) =>
                            note.coords ? (
                                <Marker position={note.coords} key={note.id}>
                                    <Popup>
                                        {note.title}
                                    </Popup>
                                </Marker>
                            ) : null
                        )}

                    </MapContainer>

                </IonContent>
            </IonModal>
        </div>
    );
}

export default ModalMap;
